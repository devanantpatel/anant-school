import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Share2, ChevronUp, ChevronDown, Video, UserCheck, Users } from "lucide-react";
import Peer from "peerjs";
import MultiMediaStage from "../components/classroom/PresentationStage/MultiMediaStage";
import TeacherMediaToolbar from "../components/classroom/PresentationStage/TeacherMediaToolbar";
import ScrollingGrid from "../components/classroom/WebGrid/ScrollingGrid";
import HostControlsBar from "../components/classroom/WebGrid/HostControlsBar";
import TabSwitcher from "../components/classroom/WorkspaceTabs/TabSwitcher";
import LiveQnA from "../components/classroom/WorkspaceTabs/LiveQnA";
import PreviousLectures from "../components/classroom/WorkspaceTabs/PreviousLectures";
import ClassworkBoard from "../components/classroom/WorkspaceTabs/ClassworkBoard";
import DiscussionRooms from "../components/classroom/WorkspaceTabs/DiscussionRooms";
import AttendanceModal from "../components/classroom/AttendanceModal";
import ReactionsOverlay from "../components/classroom/ReactionsOverlay";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

export default function ClassroomPage({ classroom, onBack }) {
  const { user } = useAuth();
  
  // Bulletproof Role Check: User role 'teacher' ho ya classroom ka creator ho
  const isTeacher = user?.role === "teacher" || classroom?.teacher_id === user?.id;

  // Stage & Presentation State
  const [stageMode, setStageMode] = useState("youtube");
  const [contentUrl, setContentUrl] = useState("https://www.youtube.com/watch?v=jfKfPfyJRdk");
  const [noticeText, setNoticeText] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [isStageCollapsed, setIsStageCollapsed] = useState(false);
  const [isVideoGridCollapsed, setIsVideoGridCollapsed] = useState(false);

  // AV State & Media Streams
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [areAllMuted, setAreAllMuted] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  // WebRTC Peer References
  const peerInstance = useRef(null);
  const activeCalls = useRef({});
  const remoteStreams = useRef({});

  // Teacher Info & Online State
  const [teacherData, setTeacherData] = useState({
    name: classroom?.teacher_name || "Lead Educator",
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(classroom?.teacher_name || "Teacher")}`,
    isOnline: false,
    isMuted: true,
    isCameraOn: false,
    stream: null,
  });

  // Unique Non-Teacher Participants
  const [participants, setParticipants] = useState([]);

  // Attendance & Presence State
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [liveAttendeesCount, setLiveAttendeesCount] = useState(1);
  const [activeTab, setActiveTab] = useState("live-qna");

  // Floating Reactions State
  const [reactions, setReactions] = useState([]);
  const [roomChannelState, setRoomChannelState] = useState(null);
  const roomChannelRef = useRef(null);

  // 1. Auto-Restore Classroom Stage State on Page Refresh
  useEffect(() => {
    if (!classroom?.id) return;

    const restoreClassState = async () => {
      const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classroom.id)
        .single();

      if (data) {
        if (data.current_stream_url) setContentUrl(data.current_stream_url);
        if (data.current_mode) setStageMode(data.current_mode);
        if (data.notice_text !== undefined) setNoticeText(data.notice_text || "");
        setIsLive(data.is_live || false);
        setTeacherData((prev) => ({
          ...prev,
          name: data.teacher_name || prev.name,
        }));
      }
    };

    restoreClassState();

    const classWatcher = supabase
      .channel(`class_state_${classroom.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "classes", filter: `id=eq.${classroom.id}` },
        (payload) => {
          if (payload.new && !isTeacher) {
            setContentUrl(payload.new.current_stream_url);
            setStageMode(payload.new.current_mode);
            setNoticeText(payload.new.notice_text || "");
            setIsLive(payload.new.is_live);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(classWatcher);
    };
  }, [classroom?.id, isTeacher]);

  // 2. Initialize WebRTC Peer Connection
  useEffect(() => {
    if (!user?.id || !classroom?.id) return;

    const peerId = `as_${classroom.id}_${user.id}`.replace(/[^a-zA-Z0-9_-]/g, "");
    const peer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peerInstance.current = peer;

    peer.on("call", (call) => {
      call.answer(localStream || undefined);

      call.on("stream", (remoteStream) => {
        const callerUserId = call.peer.split(`as_${classroom.id}_`)[1];
        remoteStreams.current[callerUserId] = remoteStream;

        if (callerUserId === classroom.teacher_id || call.metadata?.role === "teacher") {
          setTeacherData((prev) => ({
            ...prev,
            stream: remoteStream,
            isOnline: true,
          }));
        } else {
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === callerUserId ? { ...p, mediaStream: remoteStream } : p
            )
          );
        }
      });

      activeCalls.current[call.peer] = call;
    });

    return () => {
      peer.destroy();
    };
  }, [classroom?.id, user?.id]);

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  const callPeer = (remotePeerUserId, remoteRole) => {
    if (!peerInstance.current || !localStream || remotePeerUserId === user.id) return;

    const targetPeerId = `as_${classroom.id}_${remotePeerUserId}`.replace(/[^a-zA-Z0-9_-]/g, "");
    if (activeCalls.current[targetPeerId]) return;

    const call = peerInstance.current.call(targetPeerId, localStream, {
      metadata: { role: user.role, userId: user.id },
    });

    if (call) {
      call.on("stream", (remoteStream) => {
        remoteStreams.current[remotePeerUserId] = remoteStream;

        if (remoteRole === "teacher") {
          setTeacherData((prev) => ({
            ...prev,
            stream: remoteStream,
            isOnline: true,
          }));
        } else {
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === remotePeerUserId ? { ...p, mediaStream: remoteStream } : p
            )
          );
        }
      });

      activeCalls.current[targetPeerId] = call;
    }
  };

  // 3. Real-time Presence, Stage Sync, Mute, Hand Raise & Reactions
  useEffect(() => {
    if (!classroom?.id || !user) return;

    const logAttendance = async () => {
      await supabase.from("class_attendance").insert([
        {
          class_id: classroom.id,
          user_id: user.id || "usr_guest",
          user_name: user.name || "Anonymous",
          user_role: user.role || "student",
        },
      ]);
      const { data } = await supabase
        .from("class_attendance")
        .select("*")
        .eq("class_id", classroom.id)
        .order("joined_at", { ascending: true });
      if (data) setAttendanceLogs(data);
    };

    logAttendance();

    const room = supabase.channel(`unified_room_${classroom.id}`, {
      config: { presence: { key: user.id } },
    });
    roomChannelRef.current = room;
    setRoomChannelState(room);

    room.on("broadcast", { event: "stage_cast_update" }, ({ payload }) => {
      if (!isTeacher) {
        setStageMode(payload.mode);
        setContentUrl(payload.contentUrl);
        setNoticeText(payload.noticeText || "");
        setIsLive(payload.isLive || false);
      }
    });

    room.on("broadcast", { event: "emoji_reaction" }, ({ payload }) => {
      const newReaction = {
        id: "react_" + Date.now() + Math.random(),
        emoji: payload.emoji,
        senderName: payload.senderName,
        left: Math.floor(Math.random() * 70) + 15,
      };
      setReactions((prev) => [...prev, newReaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
      }, 3000);
    });

    room.on("broadcast", { event: "mute_all_command" }, () => {
      if (!isTeacher) {
        if (localStream) {
          localStream.getAudioTracks().forEach((t) => (t.enabled = false));
        }
        setIsMicOn(false);
      }
      setParticipants((prev) => prev.map((p) => ({ ...p, isMuted: true })));
      room.track({
        user_id: user.id,
        user_name: user.name,
        role: user.role,
        avatar: user.avatar,
        isHandRaised: isHandRaised,
        isMuted: true,
        isCameraOn: isCamOn,
      });
    });

    room.on("broadcast", { event: "individual_mute_command" }, ({ payload }) => {
      if (payload.targetUserId === user.id) {
        if (localStream) {
          localStream.getAudioTracks().forEach((t) => (t.enabled = false));
        }
        setIsMicOn(false);
        room.track({
          user_id: user.id,
          user_name: user.name,
          role: user.role,
          avatar: user.avatar,
          isHandRaised: isHandRaised,
          isMuted: true,
          isCameraOn: isCamOn,
        });
      }
      setParticipants((prev) =>
        prev.map((p) => (p.id === payload.targetUserId ? { ...p, isMuted: true } : p))
      );
    });

    room.on("broadcast", { event: "lower_all_hands_command" }, () => {
      setIsHandRaised(false);
      setParticipants((prev) => prev.map((p) => ({ ...p, isHandRaised: false })));
      room.track({
        user_id: user.id,
        user_name: user.name,
        role: user.role,
        avatar: user.avatar,
        isHandRaised: false,
        isMuted: !isMicOn,
        isCameraOn: isCamOn,
      });
    });

    room
      .on("presence", { event: "sync" }, () => {
        const state = room.presenceState();
        let teacherOnline = false;
        let teacherMuted = true;
        let teacherCam = false;
        const studentMap = new Map();

        Object.keys(state).forEach((key) => {
          const presences = state[key];
          if (presences && presences.length > 0) {
            const p = presences[0];

            if (p.role === "teacher" || p.user_id === classroom?.teacher_id) {
              teacherOnline = true;
              teacherMuted = p.isMuted !== false;
              teacherCam = p.isCameraOn === true;

              setTeacherData((prev) => ({
                ...prev,
                name: p.user_name || prev.name,
                avatar: p.avatar || prev.avatar,
                isOnline: true,
                isMuted: teacherMuted,
                isCameraOn: teacherCam,
                stream: isTeacher ? localStream : (remoteStreams.current[p.user_id] || prev.stream),
              }));

              if (!isTeacher && localStream) {
                callPeer(p.user_id, "teacher");
              }
            } else {
              const isSelf = p.user_id === user.id;
              studentMap.set(p.user_id, {
                id: p.user_id,
                name: p.user_name,
                role: p.role,
                avatar: p.avatar,
                isSelf: isSelf,
                isCameraOn: isSelf ? isCamOn : p.isCameraOn || false,
                isMuted: isSelf ? !isMicOn : p.isMuted !== false,
                isHandRaised: isSelf ? isHandRaised : p.isHandRaised === true,
                mediaStream: isSelf ? localStream : (remoteStreams.current[p.user_id] || null),
              });

              if (localStream && !isSelf) {
                callPeer(p.user_id, "student");
              }
            }
          }
        });

        if (!isTeacher && !studentMap.has(user.id)) {
          studentMap.set(user.id, {
            id: user.id,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            isSelf: true,
            isCameraOn: isCamOn,
            isMuted: !isMicOn,
            isHandRaised: isHandRaised,
            mediaStream: localStream,
          });
        }

        setTeacherData((prev) => ({
          ...prev,
          isOnline: isTeacher ? true : teacherOnline,
          isMuted: isTeacher ? !isMicOn : teacherMuted,
          isCameraOn: isTeacher ? isCamOn : teacherCam,
          stream: isTeacher ? localStream : prev.stream,
        }));

        setParticipants(Array.from(studentMap.values()));
        setLiveAttendeesCount(Math.max(1, Object.keys(state).length));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await room.track({
            user_id: user.id,
            user_name: user.name,
            role: user.role,
            avatar: user.avatar,
            isHandRaised: isHandRaised,
            isMuted: !isMicOn,
            isCameraOn: isCamOn,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, [classroom?.id, user, isTeacher, localStream]);

  // Stage Broadcaster
  const handleBroadcastStage = async (newMode, newUrl, newNotice = "") => {
    setStageMode(newMode);
    if (newUrl) setContentUrl(newUrl);
    if (newNotice !== undefined) setNoticeText(newNotice);

    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: "broadcast",
        event: "stage_cast_update",
        payload: {
          mode: newMode,
          contentUrl: newUrl || contentUrl,
          noticeText: newNotice,
          isLive: isLive,
        },
      });
    }

    if (isTeacher && classroom?.id) {
      await supabase
        .from("classes")
        .update({
          current_mode: newMode,
          current_stream_url: newUrl || contentUrl,
          notice_text: newNotice,
          is_live: isLive,
        })
        .eq("id", classroom.id);
    }
  };

  const handleSendReaction = (emoji) => {
    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: "broadcast",
        event: "emoji_reaction",
        payload: {
          emoji: emoji,
          senderName: user?.name || "Student",
        },
      });
    }
  };

  const handleToggleHand = async () => {
    const nextHandState = !isHandRaised;
    setIsHandRaised(nextHandState);

    if (roomChannelRef.current) {
      await roomChannelRef.current.track({
        user_id: user.id,
        user_name: user.name,
        role: user.role,
        avatar: user.avatar,
        isHandRaised: nextHandState,
        isMuted: !isMicOn,
        isCameraOn: isCamOn,
      });
    }

    setParticipants((prev) =>
      prev.map((p) => (p.isSelf ? { ...p, isHandRaised: nextHandState } : p))
    );
  };

  const handleLowerAllHands = () => {
    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: "broadcast",
        event: "lower_all_hands_command",
        payload: {},
      });
    }
    setParticipants((prev) => prev.map((p) => ({ ...p, isHandRaised: false })));
  };

  const handleToggleMute = (targetUserId) => {
    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: "broadcast",
        event: "individual_mute_command",
        payload: { targetUserId },
      });
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id === targetUserId ? { ...p, isMuted: true } : p))
    );
  };

  const handleToggleMuteAll = () => {
    const nextState = !areAllMuted;
    setAreAllMuted(nextState);

    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: "broadcast",
        event: "mute_all_command",
        payload: {},
      });
    }
    setParticipants((prev) => prev.map((p) => ({ ...p, isMuted: true })));
  };

  const handleToggleCam = async () => {
    if (!isCamOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: true,
        });

        stream.getAudioTracks().forEach((track) => (track.enabled = isMicOn));

        setLocalStream(stream);
        setIsCamOn(true);

        if (isTeacher) {
          setTeacherData((prev) => ({
            ...prev,
            stream: stream,
            isCameraOn: true,
          }));
        }

        if (peerInstance.current) {
          participants.forEach((p) => {
            if (!p.isSelf) {
              const targetPeerId = `as_${classroom.id}_${p.id}`.replace(/[^a-zA-Z0-9_-]/g, "");
              const call = peerInstance.current.call(targetPeerId, stream, {
                metadata: { role: user.role, userId: user.id },
              });
              if (call) {
                call.on("stream", (remoteStream) => {
                  remoteStreams.current[p.id] = remoteStream;
                  setParticipants((prev) =>
                    prev.map((item) => item.id === p.id ? { ...item, mediaStream: remoteStream } : item)
                  );
                });
                activeCalls.current[targetPeerId] = call;
              }
            }
          });
        }

        if (roomChannelRef.current) {
          roomChannelRef.current.track({
            user_id: user.id,
            user_name: user.name,
            role: user.role,
            avatar: user.avatar,
            isHandRaised: isHandRaised,
            isMuted: !isMicOn,
            isCameraOn: true,
          });
        }
      } catch (err) {
        console.error("Camera access error:", err);
        alert("Camera permission denied in browser.");
      }
    } else {
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => track.stop());
      }
      setIsCamOn(false);

      if (isTeacher) {
        setTeacherData((prev) => ({
          ...prev,
          isCameraOn: false,
        }));
      }

      if (roomChannelRef.current) {
        roomChannelRef.current.track({
          user_id: user.id,
          user_name: user.name,
          role: user.role,
          avatar: user.avatar,
          isHandRaised: isHandRaised,
          isMuted: !isMicOn,
          isCameraOn: false,
        });
      }
    }
  };

  const handleToggleMic = () => {
    const nextMicState = !isMicOn;
    setIsMicOn(nextMicState);

    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = nextMicState;
      });
    }

    if (roomChannelRef.current) {
      roomChannelRef.current.track({
        user_id: user.id,
        user_name: user.name,
        role: user.role,
        avatar: user.avatar,
        isHandRaised: isHandRaised,
        isMuted: !nextMicState,
        isCameraOn: isCamOn,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* 1. Visible Floating Reactions Overlay */}
      <ReactionsOverlay reactions={reactions} />

      {/* 2. Top Header */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[180px] sm:max-w-md">{classroom?.title}</h2>
            <span className="text-[11px] text-gray-400 font-mono">Code: {classroom?.code}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-800/80 border border-gray-700 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-bold">{liveAttendeesCount}</span>
            <span className="hidden sm:inline text-gray-400">Online</span>
          </div>

          {isTeacher && (
            <button
              onClick={() => setAttendanceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition"
              title="View Attendance & Export Report"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register</span>
            </button>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(classroom?.code || "");
              alert("Class Code copied!");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        </div>
      </header>

      {/* 3. Main Room Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* Presentation Stage with Normalized Stroke Sync & Persistent Broadcasting */}
        <MultiMediaStage
          mode={stageMode}
          contentUrl={contentUrl}
          noticeText={noticeText}
          isLive={isLive}
          isCollapsed={isStageCollapsed}
          onToggleCollapse={() => setIsStageCollapsed(!isStageCollapsed)}
          roomChannel={roomChannelState}
        />

        {/* Teacher Presentation Broadcaster Tools */}
        <TeacherMediaToolbar
          onBroadcastStage={handleBroadcastStage}
          isLive={isLive}
          onToggleLive={() => handleBroadcastStage(stageMode, contentUrl, noticeText)}
          isTeacherOverride={isTeacher}
        />

        {/* WebCam Video Room with WebRTC Streaming */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs text-gray-400">
            <span className="flex items-center gap-1 font-semibold">
              <Video className="w-3.5 h-3.5 text-indigo-400" /> Peer Video Room
            </span>
            <button
              onClick={() => setIsVideoGridCollapsed(!isVideoGridCollapsed)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white"
            >
              {isVideoGridCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span>{isVideoGridCollapsed ? "Show Webcams" : "Hide Webcams"}</span>
            </button>
          </div>

          {!isVideoGridCollapsed && (
            <ScrollingGrid
              teacherInfo={teacherData}
              teacherStream={teacherData.stream}
              isTeacherCamOn={teacherData.isCameraOn}
              isTeacherMuted={teacherData.isMuted}
              isTeacherOnline={teacherData.isOnline}
              participants={participants}
              onToggleMute={handleToggleMute}
            />
          )}

          <HostControlsBar
            isMicOn={isMicOn}
            isCamOn={isCamOn}
            isHandRaised={isHandRaised}
            areAllMuted={areAllMuted}
            onToggleMic={handleToggleMic}
            onToggleCam={handleToggleCam}
            onToggleHand={handleToggleHand}
            onToggleMuteAll={handleToggleMuteAll}
            onLowerAllHands={handleLowerAllHands}
            onSendReaction={handleSendReaction}
          />
        </div>

        {/* Workspace 3-Tabs */}
        <div className="pt-2">
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === "live-qna" && <LiveQnA classId={classroom?.id || "cls_1"} />}
          {activeTab === "lectures" && (
            <PreviousLectures
              onPlayRecordedLecture={(url) => {
                handleBroadcastStage("youtube", url, "");
                setIsStageCollapsed(false);
              }}
            />
          )}
          {activeTab === "classwork" && (
            <ClassworkBoard
              classId={classroom?.id || "cls_1"}
              onPreviewMedia={(url, type) => {
                handleBroadcastStage(type, url, "");
                setIsStageCollapsed(false);
              }}
            />
          )}
          {activeTab === "community" && <DiscussionRooms classId={classroom?.id || "cls_1"} />}
        </div>
      </main>

      {/* Attendance & CSV Register Modal */}
      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        attendanceLogs={attendanceLogs}
        classTitle={classroom?.title || "Classroom"}
      />
    </div>
  );
}
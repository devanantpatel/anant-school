/**
 * Telegram Storage Pipeline with Live Speed & 2-Way Deletion
 */

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const uploadToTelegramWithProgress = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!BOT_TOKEN || !CHAT_ID) {
      return reject(new Error("Telegram Bot Token ya Channel ID .env me missing hai!"));
    }

    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("document", file);
    formData.append("caption", `📚 Anant School Vault: ${file.name}`);

    const xhr = new XMLHttpRequest();
    let startTime = Date.now();
    let prevLoaded = 0;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        const currentTime = Date.now();
        const timeDiffSeconds = (currentTime - startTime) / 1000;

        let speedString = "Calculating...";
        if (timeDiffSeconds > 0.25) {
          const bytesPerSecond = (event.loaded - prevLoaded) / timeDiffSeconds;
          if (bytesPerSecond > 1024 * 1024) {
            speedString = `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
          } else {
            speedString = `${(bytesPerSecond / 1024).toFixed(0)} KB/s`;
          }
          startTime = currentTime;
          prevLoaded = event.loaded;
        }

        if (onProgress) {
          onProgress({
            percentage: percentComplete,
            loadedMB: (event.loaded / (1024 * 1024)).toFixed(1),
            totalMB: (event.total / (1024 * 1024)).toFixed(1),
            speed: speedString,
          });
        }
      }
    };

    xhr.onload = async () => {
      try {
        const resData = JSON.parse(xhr.responseText);
        if (!resData.ok) {
          return reject(new Error(resData.description || "Telegram upload failed"));
        }

        const messageId = resData.result.message_id;
        const fileId = resData.result.document.file_id;

        // Fetch direct download link from Telegram API
        const fileInfoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
        const fileInfo = await fileInfoRes.json();

        if (!fileInfo.ok) {
          return reject(new Error("Failed to get download URL from Telegram"));
        }

        const filePath = fileInfo.result.file_path;
        resolve({
          messageId: messageId,
          fileUrl: `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        });
      } catch (err) {
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error("Network connection error during file upload"));
    xhr.open("POST", `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`);
    xhr.send(formData);
  });
};

// Permanent 2-Way deletion from Telegram private channel
export const deleteFromTelegram = async (messageId) => {
  if (!BOT_TOKEN || !CHAT_ID || !messageId) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        message_id: messageId,
      }),
    });
    const resData = await response.json();
    return resData.ok;
  } catch (err) {
    console.error("Telegram deletion error:", err);
    return false;
  }
};
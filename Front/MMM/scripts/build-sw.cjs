// scripts/build-sw.cjs
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const templatePath = path.resolve(process.cwd(), "src/firebase-messaging-sw.template.js");
const outputPath = path.resolve(process.cwd(), "public/firebase-messaging-sw.js");

fs.readFile(templatePath, "utf8", (err, data) => {
    if (err) {
        console.error("템플릿 파일 읽기 실패:", err);
        process.exit(1);
    }
    const replaced = data
        .replace(/%VITE_API_KEY%/g, process.env.VITE_API_KEY)
        .replace(/%VITE_AUTH_DOMAIN%/g, process.env.VITE_AUTH_DOMAIN)
        .replace(/%VITE_PROJECT_ID%/g, process.env.VITE_PROJECT_ID)
        .replace(/%VITE_STORAGE_BUCKET%/g, process.env.VITE_STORAGE_BUCKET)
        .replace(/%VITE_MESSAGING_SENDER_ID%/g, process.env.VITE_MESSAGING_SENDER_ID)
        .replace(/%VITE_APP_ID%/g, process.env.VITE_APP_ID)
        .replace(/%VITE_FRONT_URL%/g, process.env.VITE_FRONT_URL)
        .replace(/%VITE_MEASURE_MENT_ID%/g, process.env.VITE_MEASURE_MENT_ID)
        .replace(/%VITE_FCM_FRONT_URL%/g, process.env.VITE_FCM_FRONT_URL);

    fs.writeFile(outputPath, replaced, "utf8", (err) => {
        if (err) {
        console.error("서비스 워커 파일 작성 실패:", err);
        process.exit(1);
        }
        console.log("서비스 워커 파일 생성 완료:", outputPath);
    });
});

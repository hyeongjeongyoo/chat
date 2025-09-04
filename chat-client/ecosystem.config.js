   // ecosystem.config.js
   module.exports = {
    apps: [
      {
        name: 'h-startup', // PM2에서 사용할 애플리케이션 이름
        script: 'pnpm',
        args: 'start',      // package.json의 "start" 스크립트 실행
        instances: 1,       // 단일 인스턴스. 'max'로 설정 시 CPU 코어 수만큼 실행
        exec_mode: 'cluster', // Node.js 앱에 권장, 로드 밸런싱 및 무중단 재시작 지원
        cwd: '/root/handy-cms-client', // 애플리케이션 경로 (절대 경로)
        env: {
          NODE_ENV: 'production',
          PORT: 3000,       // Next.js 앱이 실행될 포트 (Nginx가 이 포트로 프록시)
                             // package.json의 start 스크립트가 "NODE_ENV=production next start" 이므로
                             // PORT 환경변수를 통해 포트 지정 가능
        },
        // 로그 파일 경로 설정 (선택적)
        out_file: '/var/log/my-next-app/out.log',
        error_file: '/var/log/my-next-app/error.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm Z',
      },
    ],
  };
import baseConfig from './next.config.mjs';

/** 生產驗證專用：輸出到獨立 .next-prod，避免與運行中的 dev server 共用 .next 互相干擾 */
const nextConfig = {
  ...baseConfig,
  distDir: '.next-prod',
};

export default nextConfig;

/** @type {import('next').NextConfig} */

// Option B fallback: exclude node_modules from Babel loader so Babel doesn't hang on huge deps.
// Used when .babelrc exists (Babel fallback for broken SWC).
function excludeNodeModulesFromBabelLoader(config) {
  const nodeModulesExclude = /node_modules/;
  function hasBabelLoader(rule) {
    if (!rule) return false;
    if (typeof rule.loader === "string" && rule.loader.includes("babel")) return true;
    if (rule.use) {
      const use = Array.isArray(rule.use) ? rule.use : [rule.use];
      return use.some((u) => typeof u === "string" ? u.includes("babel") : (u && u.loader && String(u.loader).includes("babel")));
    }
    return false;
  }
  function applyExclude(rules) {
    if (!Array.isArray(rules)) return;
    for (const rule of rules) {
      if (rule.oneOf) {
        applyExclude(rule.oneOf);
        continue;
      }
      if (hasBabelLoader(rule)) {
        rule.exclude = rule.exclude ? [rule.exclude, nodeModulesExclude] : nodeModulesExclude;
      }
      if (rule.rules) applyExclude(rule.rules);
    }
  }
  applyExclude(config.module.rules);
}

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    excludeNodeModulesFromBabelLoader(config);
    return config;
  },
};

module.exports = nextConfig;

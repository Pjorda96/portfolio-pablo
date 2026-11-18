import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The React Compiler memoizes components and hooks on its own. It is a
  // top-level flag since Next 16 and needs `babel-plugin-react-compiler` as a
  // devDependency: a missing plugin is a build failure, not a silent no-op.
  reactCompiler: true,
  poweredByHeader: false,
};

export default nextConfig;

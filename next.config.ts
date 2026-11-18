import type { NextConfig } from 'next';

// Validates the environment as soon as Next loads its config, so `next dev`
// and `next build` stop with a readable list of invalid variables.
import './src/env';

const nextConfig: NextConfig = {
  // The React Compiler memoizes components and hooks on its own. It is a
  // top-level flag since Next 16 and needs `babel-plugin-react-compiler` as a
  // devDependency: a missing plugin is a build failure, not a silent no-op.
  reactCompiler: true,
  poweredByHeader: false,
};

export default nextConfig;

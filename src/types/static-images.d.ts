// Types for static image imports (`import avatar from '@/assets/avatar.webp'`).
// next-env.d.ts also references them, but it is gitignored and only generated
// by `next dev` / `next build`, so CI's typecheck (which runs before the build)
// would not see them without this committed reference.
/// <reference types="next/image-types/global" />

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.GITHUB_ACTIONS === 'true' ? '/milich-project-manager' : '';
  return {
    name: 'Milich Project Manager',
    short_name: 'Milich PM',
    description: 'مدیریت پروژه‌ها و کارهای میلیچ',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#8b1025',
    lang: 'fa',
    dir: 'rtl',
    icons: [{ src: `${base}/icon.svg`, sizes: 'any', type: 'image/svg+xml' }]
  };
}

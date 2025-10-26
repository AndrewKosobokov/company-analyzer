import localFont from 'next/font/local';

export const tildaSans = localFont({
  src: [
    {
      path: '../public/fonts/TildaSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/TildaSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/TildaSans-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/TildaSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-tilda',
  display: 'swap',
});




































// "use client";

// import './globals.css'

// import React, { useEffect, useState } from "react";
// import Loader from "@/components/common/Loader";

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {

//   const [loading, setLoading] = useState<boolean>(true);

//   // const pathname = usePathname();

//   useEffect(() => {
//     setTimeout(() => setLoading(false), 1000);
//   }, []);

//   return (
//     <html lang="en">
//       <body suppressHydrationWarning={true}>
//         <div className="dark:bg-boxdark-2 dark:text-bodydark">
//           {loading ? <Loader /> : children}
//         </div>
//       </body>
//     </html>
//   );
// }

"use client";

// import "./globals.css";
// import React from "react";
// import { LoaderProvider } from "@/context/LoaderContext";

// export default function RootLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <html lang="en">
//       <body suppressHydrationWarning={true}>
//         <LoaderProvider>
//           <div className="dark:bg-boxdark-2 dark:text-bodydark">{children}</div>
//         </LoaderProvider>
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import React from "react";
import { LoaderProvider } from "@/context/LoaderContext";
import { TextFormatterProvider } from "@/context/TextFormatterContext";
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
      <TextFormatterProvider>
        <LoaderProvider>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">{children}</div>
        </LoaderProvider>
        </TextFormatterProvider>
      </body>
    </html>
  );
}

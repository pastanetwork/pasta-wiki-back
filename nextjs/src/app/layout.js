import "./globals.css";

export const metadata = {
  title: "Pastanetwork Wiki",
  description: "The ultimate guide to Pastanetwork",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

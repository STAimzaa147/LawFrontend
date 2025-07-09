"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const UrgentConsultationButton = () => {
  const pathname = usePathname();

  // Hide on login and register pages
  const hideOnRoutes = ["/api/auth/signin", "/register", "/auth/signout"];
  if (hideOnRoutes.includes(pathname)) return null;

  return (
    <div className="fixed bottom-10 right-7 z-50">
      <Link href="/urgent-consultation">
        <button className="bg-red-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-red-700">
          ปรึกษาทนายทันที
        </button>
      </Link>
    </div>
  );
};

export default UrgentConsultationButton;

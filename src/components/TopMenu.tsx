"use client";

import Image from "next/image";
import TopMenuItem from "./TopMenuItem";
import Link from "next/link";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useSession } from "next-auth/react";

export default function TopMenu(){

    const { data: session } = useSession();
    console.log("token : ", session?.accessToken);
    console.log("User Data : ",session?.user);
    return(
        <div className="bg-white h-[80px] top-0 left-0 right-0 z-30 fixed border-y border-solid border-gray-100 items-center flex flex-row justify-between">
            {/* Left Section */}
            <div className="flex flex-row item-center gap-4 m-2">
                <Link href="/">
                    <Image src={'/img/Logo.jpg'} className="object-contain" alt="logo" width={70} height={20} sizes="100vh" unoptimized/>
                </Link>
                
                <TopMenuItem title="กระทู้" pageRef="/forum"/>
                <TopMenuItem title="ข่าว" pageRef="/news"/>
                <TopMenuItem title="บทความ" pageRef="/articles"/>
                {
                    session ? (
                        <>
                            <TopMenuItem title="ปฏิทิน" pageRef="/schedule" />
                            <TopMenuItem title="แชท" pageRef="/chatai" />
                            <TopMenuItem title="คดี" pageRef="/case" />
                        </>
                    ):(
                        <>
                        </>
                    )
                }
            </div>
            {/* Right Section */}
            <div className="flex flex-inverse-row items-center gap-6 pr-6 h-full ">
            {
                session ? (
                    <Menu as="div" className="relative inline-block text-left">
                        <MenuButton className="flex items-center gap-2 focus:outline-none">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                            src={session.user?.image || "/img/default-avatar.jpg"}
                            alt="avatar"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        </div>
                        <span className="text-gray-700 font-medium">
                            สวัสดี, {session.user?.name?.split(" ")[0] || "ผู้ใช้"}
                        </span>
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-44 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                        <div className="py-1">
                            <MenuItem>
                            {({ active }) => (
                                <Link
                                href="/users/profile"
                                className={`block px-4 py-2 text-sm ${
                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                }`}
                                >
                                โปรไฟล์
                                </Link>
                            )}
                            </MenuItem>
                            <MenuItem>
                            {({ active }) => (
                                <Link
                                href="/payment"
                                className={`block px-4 py-2 text-sm ${
                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                }`}
                                >
                                การชำระเงิน
                                </Link>
                            )}
                            </MenuItem>
                            <MenuItem>
                            {({ active }) => (
                                <Link
                                href="/auth/signout"
                                className={`block px-4 py-2 text-sm ${
                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                }`}
                                >
                                ออกจากระบบ
                                </Link>
                            )}
                            </MenuItem>
                        </div>
                        </MenuItems>
                    </Menu>
                    //<TopMenuItem title="ออกจากระบบ" pageRef="/auth/signout" />
                ):(
                    <>
                        <TopMenuItem title="เข้าสู่ระบบ" pageRef="/api/auth/signin" />
                        <TopMenuItem title="ลงทะเบียน" pageRef="/register"/>
                    </>
                )
                        
            }
                
            </div>
        </div>
    );
}
"use client";
import { signOutAction } from "@/actions/auth";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarHeart,
  ChevronsRight,
  ContactRound,
  Stethoscope,
  Telescope,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div className="w-full flex flex-col gap-4">
        <div className="w-full bg-[#e8f6e9] p-4 rounded-lg flex flex-row justify-between">
          <div className="max-w-2xl">
            <h1 className="font-bold text-primary text-2xl mb-2">
              Xin chào {session.user?.name}!
            </h1>
            <p>
              Chào mừng bạn đến với
              <strong className="text-primary ml-1">Beetamin</strong>
              <br />
              Đây là trang tổng quan về các chức năng chính và các thông tin sức
              khoẻ cơ bản của bạn.
            </p>
          </div>
          <div className="bg-white rounded-tl-[55px] rounded-br-[55px] px-8 flex items-center">
            <h1 className="text-primary font-bold">{session.user?.name}</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2 justify-between">
            <div className="flex flex-row items-center">
              <CalendarHeart color="#ff914d" className="w-[48px]" />
              <h3 className="text-primary font-bold ml-2">Lịch hẹn</h3>
            </div>
            <p>Nơi bạn có thể đặt mới hoặc thay đổi lịch hẹn sắp tới</p>
            <div className="flex flex-col gap-2">
              <div>
                <div className="grid grid-cols-2 grid-rows-2 gap-2">
                  <div className="row-span-2 w-[80px] h-[80px] bg-green-300 flex flex-col items-center justify-center p-3 rounded-2xl">
                    <span className="font-bold">1</span>
                    <span className="text-sm">Ngày tới</span>
                  </div>
                  <div className="text-left font-bold">20/10/2025</div>
                  <div className="text-left">3</div>
                </div>
              </div>
            </div>
            <div>
              <Separator />
              <Link
                href="app/appointments"
                className="flex flex-row items-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 group justify-center mt-2"
              >
                <span className="mr-2 font-semibold">Đến lịch hẹn</span>
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2 justify-between">
            <div className="flex flex-row items-center">
              <ContactRound color="#ff914d" />
              <h3 className="text-primary font-bold ml-2">
                Người đại diện / liên hệ khẩn cấp
              </h3>
            </div>
            <p>
              Thêm, chỉnh sửa, sắp xếp thông tin người đại diện / người liên hệ
              khẩn cấp
            </p>
            <div>
              <Separator />
              <Link
                href="app/appointments"
                className="flex flex-row items-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 group justify-center mt-2"
              >
                <span className="mr-2 font-semibold">
                  Đến thông tin liên hệ
                </span>
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2 justify-between">
            <div className="flex flex-row items-center">
              <Stethoscope color="#ff914d" />
              <h3 className="text-primary font-bold ml-2">
                Bác sĩ cá nhân / người chăm sóc sức khoẻ
              </h3>
            </div>
            <p>
              Thông tin người chăm sóc sức khoẻ chính của bạn để liên hệ khi cần
              thiết
            </p>
            <div>
              <Link
                href="app/appointments"
                className="flex flex-row items-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 group justify-center mt-2"
              >
                <span className="mr-2 font-semibold">Đến dịch vụ</span>
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
        <Button onClick={() => signOutAction()}>Go to App</Button>
      </div>
    );
  }
}

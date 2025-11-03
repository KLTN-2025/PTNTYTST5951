"use client";
import { signOutAction } from "@/actions/auth";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  CalendarHeart,
  ContactRound,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getPatientInfoQuery } from "@/lib/querys/queries";
import { useEffect } from "react";

export default function Home() {
  const { data: patientInfo } = useQuery(getPatientInfoQuery);
  const { data: session } = useSession();
  useEffect(() => {
    console.log("Patient Info:", patientInfo);
  }, [patientInfo]);
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
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center">
                <CalendarHeart color="#ff914d" className="w-[48px]" />
                <h3 className="text-primary font-bold ml-2">Lịch hẹn</h3>
              </div>
              <p>Nơi bạn có thể đặt mới hoặc thay đổi lịch hẹn sắp tới</p>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-row gap-2 border p-2 rounded-lg shadow-sm">
                <div className="h-full aspect-square flex flex-col items-center justify-center-safe bg-green-300 rounded-sm">
                  <span className="font-bold">25</span>
                  <span className="text-sm">12/2025</span>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-1">
                  <span className="font-bold">
                    Khám online - BS. Nguyễn Hoà Anh Kiệt
                  </span>
                  <div className="flex flex-row items-center gap-2">
                    <Badge asChild>
                      <div className="flex flex-row items-center">
                        <Calendar />
                        <span className="font-bold p-1">
                          14:30 - 20/10/2025
                        </span>
                      </div>
                    </Badge>
                    <Badge asChild>
                      <div className="flex flex-row items-center">
                        <MapPin />
                        <span className="font-bold p-1">Online</span>
                      </div>
                    </Badge>
                  </div>

                  <span className="font-semibold text-sm">
                    Mã khám: 0123456789
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-2 border p-2 rounded-lg shadow-sm">
                <div className="h-full aspect-square flex flex-col items-center justify-center-safe bg-green-300 rounded-sm">
                  <span className="font-bold">25</span>
                  <span className="text-sm">12/2025</span>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-1">
                  <span className="font-bold">
                    Khám offline - BS. Nguyễn Hoà Anh Kiệt
                  </span>
                  <div className="flex flex-row items-center gap-2">
                    <Badge asChild>
                      <div className="flex flex-row items-center">
                        <Calendar />
                        <span className="font-bold p-1">
                          14:30 - 20/10/2025
                        </span>
                      </div>
                    </Badge>
                    <Badge asChild>
                      <div className="flex flex-row items-center">
                        <MapPin />
                        <span className="font-bold p-1">Bệnh viện Hoàn Mỹ</span>
                      </div>
                    </Badge>
                  </div>

                  <span className="font-semibold text-sm">
                    Mã khám: 0123456789
                  </span>
                </div>
              </div>
            </div>
            <div>
              <Separator />
              <Link
                href="app/appointments"
                className="flex flex-row items-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 group justify-center mt-2"
              >
                <span className="mr-2 font-semibold">Đến trang lịch hẹn</span>
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2 justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center">
                <ContactRound color="#ff914d" />
                <h3 className="text-primary font-bold ml-2">
                  Người đại diện / liên hệ khẩn cấp
                </h3>
              </div>
              <p>
                Thêm, chỉnh sửa, sắp xếp thông tin người đại diện / người liên
                hệ khẩn cấp
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <span className="font-thin italic">
                Bạn chưa có thông tin người đại diện / thông tin liên hệ khẩn
                cấp nào.
              </span>
            </div>

            <div>
              <Separator />
              <Link
                href="app/appointments"
                className="flex flex-row items-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 group justify-center mt-2"
              >
                <span className="mr-2 font-semibold">
                  Đến trang thông tin liên hệ
                </span>
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2 justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center">
                <ContactRound color="#ff914d" />
                <h3 className="text-primary font-bold ml-2">
                  Bác sĩ cá nhân / người chăm sóc sức khoẻ
                </h3>
              </div>
              <p>
                Thêm, chỉnh sửa, sắp xếp thông tin bác sĩ cá nhân / người chăm
                sóc sức khoẻ
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <span className="font-thin italic">
                Bạn chưa có thông tin bác sĩ cá nhân / người chăm sóc sức khoẻ
                nào.
              </span>
            </div>

            <div>
              <Separator />
              <Link
                href="app/appointments"
                className="flex flex-row items-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 group justify-center mt-2"
              >
                <span className="mr-2 font-semibold">Đến trang dịch vụ</span>
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
        <Button onClick={() => signOutAction()}>Đăng xuất</Button>
      </div>
    );
  }
}

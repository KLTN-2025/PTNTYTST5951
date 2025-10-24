import Image from "next/image";
import React from "react";

const LandingPage = () => {
  return (
    <div className="w-full">
      <section className="w-full">
        <div className="w-full flex flex-row h-screen justify-between">
          <div className="h-screen flex-1 flex flex-col justify-center pl-20">
            <h1 className="text-[80px] font-bold w-full text-[#ff914d]">
              BEETAMIN
            </h1>
            <h2 className="text-[40px] font-semibold w-full text-[#333]">
              Hệ thống Y Tế toàn diện cho người Việt
            </h2>
            <p className="text-[20px] font-normal w-full text-[#666] mt-5">
              Đặt lịch khám nhanh chóng, khám từ xa tiện lợi, quản lý hồ sơ sức
              khoẻ điện tử và theo dõi bệnh mạn tính ngay trên điện thoại.{" "}
              <br />
              Kết nối trực tiếp với bác sĩ, cơ sở y tế, phòng xét nghiệm và hiệu
              thuốc – tất cả trong một ứng dụng duy nhất.
            </p>
            <a
              type="button"
              href="/app"
              className="cursor-pointer mt-10 bg-[#ff914d] text-white text-[20px] font-semibold px-8 py-4 rounded-full hover:bg-[#e6833d] w-[200px] transition"
            >
              Truy cập ngay
            </a>
          </div>
          <Image
            className="h-full w-auto object-contain"
            src="assets/images/landing-page-01.svg"
            alt="Landing Page Image"
            width={500}
            height={500}
          />
        </div>
      </section>
      <section className="w-full text-white bg-[#ff914d]">
        <div className="flex flex-row justify-center items-center w-full h-screen px-20">
          <Image
            className="w-1/2 h-auto object-contain"
            src="assets/images/landing-page-06.svg"
            alt="Landing Page Image"
            width={1000}
            height={1000}
          />
          <div>
            <h2 className="text-[70px] font-bold w-full px-15">
              Trải nghiệm chăm sóc sức khoẻ liền mạch
            </h2>
            <p className="pl-15 flex-1 text-3xl mt-5">
              Với Beetamin, bạn không cần chuyển đổi nhiều ứng dụng rời rạc khác
              nhau.
              <br />
              Tất cả những gì bạn cần để chăm sóc sức khoẻ – từ đặt lịch khám,
              khám trực tuyến, quản lý hồ sơ đến nhận thuốc – đều tập trung
              trong một nền tảng thống nhất, an toàn và dễ sử dụng.
            </p>
          </div>
        </div>
        <div className="w-full h-screen">
          <div className="grid grid-cols-3 p-25 gap-20 h-full">
            <div className="border-white border-4 h-full overflow-hidden group">
              <div className="flex items-center justify-center h-full group-hover:h-1/2 transition-all duration-300">
                <h2 className="text-6xl font-bold text-center">
                  Đặt lịch
                  <br />&<br />
                  Check-in QR
                </h2>
              </div>
              <div className="w-full border-t-4 border-white">
                <h3 className="p-7 text-2xl">
                  Đặt hẹn khám / tiêm chủng nhanh chóng, tránh xếp hàng chờ đợi.
                  Đến cơ sở y tế chỉ cần quét QR để xác nhận và lấy số thứ tự.
                </h3>
              </div>
            </div>
            <div className="border-white border-4 h-full overflow-hidden group">
              <div className="flex items-center justify-center h-full group-hover:h-1/2 transition-all duration-300">
                <h2 className="text-6xl font-bold text-center">Khám từ xa</h2>
              </div>
              <div className="w-full border-t-4 border-white">
                <h3 className="p-7 text-2xl">
                  Kết nối trực tuyến với bác sĩ qua video/voice, được tư vấn và
                  kê đơn ngay tại nhà, an toàn và tiện lợi.
                </h3>
              </div>
            </div>
            <div className="border-white border-4 h-full overflow-hidden group">
              <div className="flex items-center justify-center h-full group-hover:h-1/2 transition-all duration-300">
                <h2 className="text-6xl font-bold text-center">
                  Hồ sơ sức khoẻ điện tử (EHR)
                </h2>
              </div>
              <div className="w-full border-t-4 border-white">
                <h3 className="p-7 text-2xl">
                  Lưu trữ tập trung toàn bộ lịch sử khám, đơn thuốc và kết quả
                  xét nghiệm, giúp bạn và bác sĩ dễ dàng theo dõi sức khoẻ lâu
                  dài.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <div className="w-full flex flex-row h-full p-20">
          <div className="px-10">
            <h1 className="text-[70px] font-bold mt-10 text-[#ff914d]">
              Lợi ích dành cho mọi đối tượng sử dụng
            </h1>
            <p className="w-full text-3xl mt-5 text-[#666]">
              Beetamin không chỉ giúp người dân chăm sóc sức khoẻ thuận tiện
              hơn, mà còn hỗ trợ bác sĩ làm việc hiệu quả và giúp cơ sở y tế tối
              ưu quy trình quản lý.
            </p>
            1
          </div>
          <Image
            className="flex-1 object-contain mx-auto"
            src="assets/images/landing-page-04.svg"
            alt="Landing Page Image"
            width={1000}
            height={800}
          />
        </div>
        <div className="w-full h-full p-20">
          <h2 className="font-bold text-8xl text-[#333]">NHÓM NGƯỜI DÙNG</h2>
          <div className="grid grid-cols-3 gap-10 mt-10">
            <div className="border-4 border-[#333] p-10 flex flex-col gap-5 items-center">
              <Image
                className="h-[300px] w-auto object-cover"
                src="assets/images/landing-page-04.svg"
                alt="User Group"
                width={1000}
                height={750}
              />
              <div className="w-full flex flex-col mt-5">
                <h3 className="font-bold text-4xl text-center w-full text-[#333]">
                  Người dùng cá nhân
                </h3>
                <p className="mt-2 text-2xl text-[#666]">
                  Dễ dàng quản lý sức khoẻ bản thân và gia đình. Chủ động theo
                  dõi sức khoẻ, đặt lịch nhanh chóng, khám từ xa và quản lý hồ
                  sơ cá nhân ở bất cứ đâu.
                </p>
              </div>
            </div>
            <div className="border-4 border-[#333] p-10 flex flex-col gap-5 items-center">
              <Image
                className="h-[300px] w-auto object-cover"
                src="assets/images/landing-page-05.svg"
                alt="User Group"
                width={1000}
                height={750}
              />
              <div className="w-full flex flex-col mt-5">
                <h3 className="font-bold text-4xl text-center w-full text-[#333]">
                  Bác sĩ & Nhân viên y tế
                </h3>
                <p className="mt-2 text-2xl text-[#666]">
                  Dễ dàng truy cập hồ sơ bệnh án, tư vấn trực tuyến và kê đơn
                  điện tử, giúp chăm sóc bệnh nhân hiệu quả và liên tục. Tối ưu
                  quy trình khám chữa bệnh.
                </p>
              </div>
            </div>
            <div className="border-4 border-[#333] p-10 flex flex-col gap-5 items-center">
              <Image
                className="h-[300px] w-auto object-cover"
                src="assets/images/landing-page-06.svg"
                alt="User Group"
                width={1000}
                height={750}
              />
              <div className="w-full flex flex-col mt-5">
                <h3 className="font-bold text-4xl text-center w-full text-[#333]">
                  Cơ sở y tế
                </h3>
                <p className="mt-2 text-2xl text-[#666]">
                  Giảm tải thủ tục hành chính, tối ưu quy trình tiếp đón – từ
                  check-in QR đến lưu trữ kết quả , quản lý hồ sơ bệnh nhân và
                  lịch khám hiệu quả. – nâng cao trải nghiệm người bệnh.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="w-full bg-[#ff914d] text-white py-20 flex flex-col items-center">
        <div className="flex flex-row justify-center items-center">
          <Image
            src="assets/images/logo-only-white.svg"
            alt="Beetamin Logo"
            width={70}
            height={70}
          />
          <h2 className="text-4xl font-bold ml-5">BEETAMIN</h2>
        </div>
        <p className="text-2xl mt-4">
          &copy; 2025 Beetamin. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

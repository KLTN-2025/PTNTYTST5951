import PractitionerQualificationForm from '@/components/form/practitioner-qualifications';
import {
  useGetPractitionerQualifications,
  useGetQualificationDocumentTypes,
} from '@/hooks/practitioner';
import { PractitionerQualification } from '@/types/api';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

const PractitionerQualifications = () => {
  const [isOpenForm, setIsOpenForm] = React.useState(false);
  const [selectedQualification, setSelectedQualification] =
    React.useState<PractitionerQualification>();
  const {
    data: practitionerQualifications,
    isFetching: isGetPractitionerQualificationsFetching,
    isError: isGetPractitionerQualificationsError,
  } = useGetPractitionerQualifications();
  const handleOpenForm = (qualification?: PractitionerQualification) => {
    setSelectedQualification(qualification);
    setIsOpenForm(true);
  };
  useEffect(() => {
    if (isGetPractitionerQualificationsError) {
      toast.error(
        'Đã có lỗi xảy ra khi tải danh sách bằng cấp / chứng chỉ của bạn.'
      );
    }
  }, [isGetPractitionerQualificationsError]);
  return (
    <div className="w-full">
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl font-semibold mb-2">
          Practitioner Qualifications
        </h2>
        {isOpenForm && (
          <button
            className="text-orange-500 underline"
            onClick={() => setIsOpenForm(false)}
          >
            Cancel
          </button>
        )}
      </div>
      {isOpenForm ? (
        <PractitionerQualificationForm
          defaultValues={selectedQualification}
          setIsFormOpen={setIsOpenForm}
        />
      ) : (
        <div className="grid grid-cols-1 min-[1200px]:grid-cols-2 min-[1400px]:grid-cols-3 gap-2">
          {practitionerQualifications?.map(
            (qualification: PractitionerQualification) => {
              return (
                <button
                  key={qualification.id}
                  className="border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-100 transition"
                  onClick={() => {
                    handleOpenForm(qualification);
                  }}
                >
                  <div className="flex flex-row items-center gap-2 mb-2">
                    <Image
                      alt="Qualification Document Type Status"
                      src={`/assets/images/${qualification.documentTypeCode.code}-${qualification.docStatus}.svg`}
                      width={25}
                      height={25}
                    />
                    <span className="font-semibold text-sm w-full overflow-hidden text-ellipsis white-nowrap block">
                      {qualification.documentSubTypeCode.display}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-sm">
                      Nơi cấp: {qualification.placeOfIssue}
                    </span>
                    <span className="font-semibold text-sm">
                      Ngày cấp: {qualification.issueDate}
                    </span>
                    <span className="font-semibold text-sm">
                      Trạng thái:
                      {qualification.docStatus === 'preliminary'
                        ? ' Chưa chính thức'
                        : qualification.docStatus === 'final'
                        ? ' Chính thức'
                        : qualification.docStatus === 'amended'
                        ? ' Đã sửa đổi'
                        : ' Không hợp lệ'}
                    </span>
                  </div>
                </button>
              );
            }
          )}

          <button
            disabled={isGetPractitionerQualificationsFetching}
            onClick={() => {
              handleOpenForm();
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg min-h-30 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600"
          >
            {isGetPractitionerQualificationsFetching
              ? 'Đang tải...'
              : 'Thêm tài liệu mới'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PractitionerQualifications;

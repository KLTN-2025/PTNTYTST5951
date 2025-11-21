import {
  useAddPractitionerQualificationMutation,
  useDeletePractitionerQualificationMutation,
  useGetQualificationDocumentTypes,
} from '@/hooks/practitioner';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectGroup,
  SelectLabel,
} from '../ui/select';
import {
  BasicCodeSystem,
  PractitionerQualification,
  UpdatePractitionerQualificationParams,
} from '@/types/api';
import MultiImageUploader from './upload-image';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Coding } from 'fhir/r4';

const PractitionerQualificationForm = ({
  defaultValues,
  setIsFormOpen,
}: {
  defaultValues?: PractitionerQualification;
  setIsFormOpen: React.Dispatch<boolean>;
}) => {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const { mutate, isError, isSuccess } =
    useAddPractitionerQualificationMutation();
  const {
    mutate: deleteMutate,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
  } = useDeletePractitionerQualificationMutation();
  const {
    data: qualificationDocumentTypes,
    isFetching: isGetQualificationDocumentTypesFetching,
    isError: isGetQualificationDocumentTypesError,
  } = useGetQualificationDocumentTypes();
  const [selectedDocumentType, setSelectedDocumentType] =
    React.useState<Coding>();
  const [selectedDocumentTypeChildCodes, setSelectedDocumentTypeChildCodes] =
    React.useState<BasicCodeSystem[]>([]);
  const [selectedDocumentTypeChildCode, setSelectedDocumentTypeChildCode] =
    React.useState<Coding>();
  const [placeOfIssue, setPlaceOfIssue] = React.useState<string>('');
  const [issueDate, setIssueDate] = React.useState<string>('');
  const [documentImages, setDocumentImages] = React.useState<
    {
      url: string;
      contentType: string;
    }[]
  >([]);

  const handleDeleteQualification = () => {
    if (!defaultValues || !defaultValues.id) {
      toast.error('Không tìm thấy bằng cấp / chứng chỉ để xoá.');
      return;
    }
    deleteMutate(defaultValues.id);
  };
  useEffect(() => {
    if (isDeleteSuccess) {
      toast.success('Xoá bằng cấp / chứng chỉ thành công.');
      setIsFormOpen(false);
    }
    if (isDeleteError) {
      toast.error('Xoá bằng cấp / chứng chỉ thất bại.');
    }
  }, [isDeleteError, isDeleteSuccess]);
  const addPractitionerQualification = (type: 'add' | 'update') => {
    if (
      !selectedDocumentType ||
      !selectedDocumentTypeChildCode ||
      !placeOfIssue ||
      !issueDate ||
      !documentImages ||
      documentImages.length === 0
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    const mutatePayload: UpdatePractitionerQualificationParams & {
      type: 'add' | 'update';
    } = {
      type,
      selectedDocumentTypeCode: selectedDocumentType,
      selectedDocumentTypeChildCode: selectedDocumentTypeChildCode,
      placeOfIssue,
      issueDate,
      documentImages,
    };
    console.log('type: ', type);
    if (type === 'update') {
      if (!defaultValues || !defaultValues.id || !defaultValues.documentId) {
        toast.error('Không tìm thấy bằng cấp / chứng chỉ để cập nhật.');
        return;
      }
      mutatePayload.qualificationId = defaultValues.id;
      mutatePayload.documentId = defaultValues.documentId;
    }
    console.log('mutatePayload: ', mutatePayload);
    mutate(mutatePayload);
  };
  const onQualificationDocumentTypeChange = (value: string) => {
    const selectedType = qualificationDocumentTypes?.find(
      (type) => type.code === value
    );
    setSelectedDocumentType({
      system: selectedType?.system || '',
      code: selectedType?.code || '',
      display: selectedType?.display || '',
    });
    if (selectedType && selectedType.children) {
      setSelectedDocumentTypeChildCodes(selectedType.children);
    } else {
      setSelectedDocumentTypeChildCodes([]);
    }
  };
  const onQualificationDocumentTypeChildChange = (value: string) => {
    const selectedTypeChild = selectedDocumentTypeChildCodes
      .map((type) => type.children || [])
      .flat()
      .find((child) => child.code === value);
    setSelectedDocumentTypeChildCode({
      system: selectedTypeChild?.system || '',
      code: selectedTypeChild?.code || '',
      display: selectedTypeChild?.display || '',
    });
  };

  useEffect(() => {
    if (defaultValues) {
      const documentTypeCode = defaultValues.documentTypeCode;
      if (qualificationDocumentTypes) {
        const selectedType = qualificationDocumentTypes.find(
          (type) => type.code === documentTypeCode.code
        );
        setSelectedDocumentType(documentTypeCode);
        if (selectedType && selectedType.children) {
          setSelectedDocumentTypeChildCodes(selectedType.children);
        } else {
          setSelectedDocumentTypeChildCodes([]);
        }
      }
      const documentSubTypeCode = defaultValues.documentSubTypeCode;
      setSelectedDocumentTypeChildCode(documentSubTypeCode);
      setPlaceOfIssue(defaultValues.placeOfIssue);
      setIssueDate(defaultValues.issueDate);
      const attachments = defaultValues.documentImages.map((attachment) => ({
        url: attachment.url,
        contentType: attachment.contentType,
      }));
      setDocumentImages(attachments);
    }
  }, [defaultValues, qualificationDocumentTypes]);

  useEffect(() => {
    if (
      isGetQualificationDocumentTypesError &&
      !isGetQualificationDocumentTypesFetching
    ) {
      toast.error('Lấy loại tài liệu bằng cấp / chứng chỉ thất bại.');
    }
  }, [
    isGetQualificationDocumentTypesError,
    isGetQualificationDocumentTypesFetching,
  ]);
  useEffect(() => {
    if (isSuccess) {
      toast.success(
        `${
          defaultValues ? 'Cập nhật' : 'Thêm'
        } bằng cấp / chứng chỉ thành công.`
      );
      if (setIsFormOpen) {
        setIsFormOpen(false);
      }
    }
    if (isError) {
      toast.error(
        `${defaultValues ? 'Cập nhật' : 'Thêm'} bằng cấp / chứng chỉ thất bại.`
      );
    }
  }, [isError, isSuccess]);
  return (
    <div className="w-full">
      <div className="flex flex-row gap-4">
        <div className="flex-1 flex flex-col">
          <span className="mb-2 font-medium">Loại tài liệu</span>
          <Select
            disabled={defaultValues && !isEditing}
            onValueChange={(value) => onQualificationDocumentTypeChange(value)}
            value={(selectedDocumentType && selectedDocumentType.code) || ''}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn loại tài liệu" />
            </SelectTrigger>
            <SelectContent>
              {qualificationDocumentTypes &&
                qualificationDocumentTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.display}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {selectedDocumentTypeChildCodes.length > 0 && (
          <div className="flex-1 flex flex-col">
            <span className="mb-2 font-medium">
              Loại{' '}
              {
                qualificationDocumentTypes?.find(
                  (type) => type.code === selectedDocumentType
                )?.display
              }
            </span>
            <Select
              disabled={defaultValues && !isEditing}
              onValueChange={(value) =>
                onQualificationDocumentTypeChildChange(value)
              }
              value={selectedDocumentTypeChildCode?.code || ''}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại tài liệu" />
              </SelectTrigger>
              <SelectContent>
                {selectedDocumentTypeChildCodes.map((type) => (
                  <SelectGroup key={type.code}>
                    <SelectLabel>{type.display}</SelectLabel>
                    {type.children &&
                      type.children.map((child) => (
                        <SelectItem key={child.code} value={child.code}>
                          {child.display}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex flex-row gap-4 mt-4 w-full">
        <div className="flex-1 flex flex-col gap-3">
          <Label htmlFor="placeOfIssue">Nơi cấp</Label>
          <Input
            disabled={defaultValues && !isEditing}
            type="text"
            className="w-full"
            id="placeOfIssue"
            placeholder="Nơi cấp"
            value={placeOfIssue}
            onChange={(e) => setPlaceOfIssue(e.target.value)}
          />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <Label htmlFor="issueDate">Ngày cấp</Label>
          <Input
            disabled={defaultValues && !isEditing}
            type="date"
            className="w-full"
            id="issueDate"
            placeholder="Ngày cấp"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4">
        <span className="font-medium">Hình ảnh</span>
        <div className="flex flex-row mt-2">
          <MultiImageUploader
            isAddAvailable={(defaultValues && isEditing) || !defaultValues}
            max={4}
            previewImages={documentImages}
            setPreviewImages={setDocumentImages}
          />
        </div>
      </div>
      <div className="flex flex-row mt-2">
        {defaultValues && !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary p-2 text-white rounded-lg mt-4 hover:bg-[#ff7900] w-full flex-1 items-center justify-center transition"
          >
            Cập nhật
          </button>
        ) : !defaultValues ? (
          <button
            onClick={() => addPractitionerQualification('add')}
            className="bg-primary p-2 text-white rounded-lg mt-4 hover:bg-primary-dark w-full flex-1 items-center justify-center transition"
          >
            Lưu
          </button>
        ) : (
          <>
            <button
              onClick={() => addPractitionerQualification('update')}
              className="bg-primary p-2 text-white rounded-lg mt-4 hover:bg-[#ff7900] w-full flex-1 items-center justify-center transition"
            >
              Lưu
            </button>
            <button
              onClick={handleDeleteQualification}
              className="border border-gray-300 p-2 text-white rounded-lg mt-4 ml-4 bg-[#d22630] hover:bg-[#ff0000] w-full flex-1 items-center justify-center transition"
            >
              Xoá
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="border border-gray-300 p-2 rounded-lg mt-4 ml-4 hover:bg-gray-100 w-full flex-1 items-center justify-center transition"
            >
              Huỷ
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PractitionerQualificationForm;

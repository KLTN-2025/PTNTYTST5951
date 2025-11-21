import React from 'react';

const InfoView = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => {
  return (
    <div className="flex flex-row w-full">
      <span className="w-[100px]">{title}: </span>
      <span className="flex-1 font-bold">{value}</span>
    </div>
  );
};

export default InfoView;

'use client';
import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';

type Department = {
  name: string;
  children?: Department[];
};

const DepartmentItem = ({ name }: { name: string }) => {
  return (
    <div className="px-4 py-2 bg-green-500 text-white rounded shadow inline-block">
      {name}
    </div>
  );
};

const DepartmentNode = ({ item }: { item: Department }) => {
  return (
    <TreeNode label={<DepartmentItem name={item.name} />}>
      {item.children?.map((child, index) => (
        <DepartmentNode key={`${item.name}-${index}`} item={child} />
      ))}
    </TreeNode>
  );
};

const departments: Department[] = [
  {
    name: 'Phòng khám A',
    children: [
      { name: 'Khoa Nội' },
      {
        name: 'Khoa Ngoại',
        children: [{ name: 'Bộ phận Phẫu thuật' }, { name: 'Bộ phận Hồi sức' }],
      },
      { name: 'Khoa Nhi' },
    ],
  },
];

const DepartmentsManagerPage = () => {
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý phòng ban</h1>

      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          {departments.map((root, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-semibold mb-2">{root.name}</h2>

              <Tree
                lineWidth="2px"
                lineColor="#4B5563"
                lineBorderRadius="8px"
                label={<DepartmentItem name={root.name} />}
              >
                {root.children?.map((child, idx) => (
                  <DepartmentNode key={`${root.name}-${idx}`} item={child} />
                ))}
              </Tree>
            </div>
          ))}
        </div>

        <div>asdasdasd</div>
      </div>
    </div>
  );
};

export default DepartmentsManagerPage;

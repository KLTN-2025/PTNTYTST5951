const OrganizationPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <div>OrganizationPage {id}</div>;
};

export default OrganizationPage;

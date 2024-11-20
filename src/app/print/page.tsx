import Print from "./component";
import { fetchPrintData } from "./fetchAction";

type SearchParamProps = {
  searchParams: {
    [key: string]: string,
    template: string,
    studentId: string,
    academicYear: string,
  }
}

export default async function PrintPage({ searchParams }: SearchParamProps) {
  const data = await fetchPrintData(searchParams.template, searchParams)
  return <Print template={searchParams.template} data={data} />
}
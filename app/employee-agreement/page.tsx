

import EmployeeAgreement from '@/components/employeeAgreement'
import DefaultLayout from '@/components/Layouts/DefaultLayout'



import { NextPage } from 'next'



const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <EmployeeAgreement />
    </DefaultLayout>
  </div>
}

export default Page
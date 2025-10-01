import DefaultLayout from '@/components/Layouts/DefaultLayout'
import LeaseContract from '@/components/leaseContract'
import { NextPage } from 'next'

const Page: NextPage= () => {
  return <div>
   <DefaultLayout>
     <LeaseContract />
    </DefaultLayout>
  </div>
}

export default Page
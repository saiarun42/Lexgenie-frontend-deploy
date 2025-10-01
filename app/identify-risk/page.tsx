

import IdentifyRisk from '@/components/identifyRisk'
import DefaultLayout from '@/components/Layouts/DefaultLayout'



import { NextPage } from 'next'


const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <IdentifyRisk />
    </DefaultLayout>
  </div>
}

export default Page
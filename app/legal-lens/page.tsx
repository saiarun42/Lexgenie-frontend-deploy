
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import LegalLens from '@/components/legalLens/legalLens'
import { NextPage } from 'next'


const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <LegalLens />
    </DefaultLayout>
  </div>
}

export default Page
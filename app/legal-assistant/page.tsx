
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import LegalAssistant from '@/components/legalAssistant'
import { NextPage } from 'next'



const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <LegalAssistant />
    </DefaultLayout>
  </div>
}

export default Page
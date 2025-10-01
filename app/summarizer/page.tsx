
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import Summarizer from '@/components/summarizer'
import { NextPage } from 'next'



const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <Summarizer />
    </DefaultLayout>
  </div>
}

export default Page
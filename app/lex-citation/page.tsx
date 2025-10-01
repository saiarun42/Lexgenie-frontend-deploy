
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import LexCitation from '@/components/lexCitation'

import { NextPage } from 'next'



const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <LexCitation />
    </DefaultLayout>
  </div>
}

export default Page


import DefaultLayout from '@/components/Layouts/DefaultLayout'
import SummariseContract from '@/components/summariseContract'

import { NextPage } from 'next'


const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <SummariseContract />
    </DefaultLayout>
  </div>
}

export default Page
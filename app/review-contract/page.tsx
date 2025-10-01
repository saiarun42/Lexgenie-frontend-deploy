

import DefaultLayout from '@/components/Layouts/DefaultLayout'
import ReviewContract from '@/components/reviewContract'


import { NextPage } from 'next'


const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <ReviewContract />
    </DefaultLayout>
  </div>
}

export default Page
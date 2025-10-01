

import ClauseRecommender from '@/components/ClauseRecommender'
import DefaultLayout from '@/components/Layouts/DefaultLayout'



import { NextPage } from 'next'



const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <ClauseRecommender />
    </DefaultLayout>
  </div>
}

export default Page
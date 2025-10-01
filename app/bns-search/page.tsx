import BnsSearch from '@/components/bnsSearch/bnsSearch'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import { NextPage } from 'next'


const Page: NextPage = () => {
  return <div>
   <DefaultLayout>
     <BnsSearch />
    </DefaultLayout>
  </div>
}

export default Page
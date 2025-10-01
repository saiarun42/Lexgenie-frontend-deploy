import HeadnoteGeneration from '@/components/HeadnoteGeneration'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import { NextPage } from 'next'



const Page: NextPage = () => {
  return <div>
    <DefaultLayout>
        <HeadnoteGeneration />
    </DefaultLayout>
  </div>
}

export default Page
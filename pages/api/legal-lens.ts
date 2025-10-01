// import { NextApiRequest, NextApiResponse } from 'next';
// import formidable, { IncomingForm, Fields, Files } from 'formidable';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// interface FormidableFiles {
//   [key: string]: formidable.File | formidable.File[] | undefined;
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const form = new IncomingForm();

//   form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to parse form data' });
//     }

//     try {
//       // Call your backend API here
//       const response = await fetch('http://44.211.157.24:8000/legal-lens', {
//         method: 'POST',
//         body: JSON.stringify(files),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to process document');
//       }

//       const data = await response.json();
//       res.status(200).json(data);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to process document' });
//     }
//   });
// }

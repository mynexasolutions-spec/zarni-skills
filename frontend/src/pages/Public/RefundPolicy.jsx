import React, { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import api from '../../utils/api';
import LegalPageLayout from '../../components/Legal/LegalPageLayout';

const SECTIONS = [
  {
    number: 1,
    title: 'Course Kharidne Se Pehle Jankari',
    paragraphs: [
      'Course kharidne se pehle customer ko course ka poora vivaran, available facilities, fees, course duration aur lagu niyamon ko dhyan se padhna chahiye.',
      'Course kharidne aur payment poora karne ke baad customer yah sweekar karta hai ki usne course ki jankari aur company ki policies ko padh aur samajh liya hai.',
    ],
  },
  {
    number: 2,
    title: 'Refund Ke Liye Patrata',
    paragraphs: [
      'Agar customer ne payment karne ke baad abhi tak course ki kisi bhi digital content ka upyog nahi kiya hai, koi video ya digital material nahi dekha hai aur kisi live class, mentorship ya anya paid facility ka labh nahi liya hai, to vah payment ke 7 din ke andar refund ke liye request kar sakta hai.',
      'Refund request prapt hone ke baad company customer ke account aur course activity ki jaanch karegi. Customer refund ke liye eligible paya jata hai, to company ki approval ke baad refund process kiya jayega.',
    ],
  },
  {
    number: 3,
    title: 'Digital Course Ka Upyog Karne Ke Baad',
    paragraphs: [
      'Agar customer ne course ki videos dekhi hain, course ka mahatvapurn hissa use kiya hai, downloadable material prapt kiya hai, live class attend ki hai, mentorship ya kisi anya digital service ka upyog kiya hai, to samanya paristhitiyon mein refund available nahi hoga.',
      'Yah niyam digital content ka upyog karne ke baad hone wale galat ya anuchit upyog ko rokne ke liye lagu kiya gaya hai.',
    ],
  },
  {
    number: 4,
    title: 'Technical Samasya',
    paragraphs: [
      'Agar payment ke baad customer ko course ka access nahi milta hai ya company ki taraf se koi technical problem hoti hai, to customer support team se sampark kar sakta hai.',
      'Company pehle problem ko solve karne ya course ka access available karane ka prayas karegi. Agar problem uchit samay ke andar solve nahi hoti aur service provide nahi ki ja sakti, to case ki jaanch ke baad refund ya anya uchit solution diya ja sakta hai.',
    ],
  },
  {
    number: 5,
    title: 'Galat Ya Duplicate Payment',
    paragraphs: [
      'Agar ek hi order ke liye galti se payment do baar ho jata hai, to customer payment proof aur avashyak details ke saath support team se sampark kar sakta hai.',
      'Verification ke baad extra ya duplicate payment ko company ki policy ke anusaar refund kiya ja sakta hai.',
    ],
  },
  {
    number: 6,
    title: 'Referral Commission',
    paragraphs: [
      'Referral commission company ki official referral policy aur eligible course sale ke niyamon ke anusaar diya jayega.',
      'Agar kisi course ka payment refund hota hai, order cancel hota hai ya transaction invalid paya jata hai, to us sale se sambandhit commission ko roka, cancel ya adjust kiya ja sakta hai.',
      'Referral commission kisi nishchit ya guaranteed income ka wada nahi hai.',
    ],
  },
  {
    number: 7,
    title: 'Refund Milne Ka Samay',
    paragraphs: [
      'Approved refund ko samanya roop se 7 se 14 working days ke andar customer ke original payment method ya company dwara available kisi uchit payment method se process karne ka prayas kiya jayega.',
      'Bank, payment gateway ya anya financial institution ki processing ke karan adhik samay lag sakta hai.',
    ],
  },
  {
    number: 8,
    title: 'Refund Request Kaise Karen',
    paragraphs: ['Refund request ke liye customer ko nimn jankari deni hogi:'],
    fields: [
      'Customer ka poora naam',
      'Registered mobile number',
      'Registered email address',
      'Order ya Transaction ID',
      'Payment ki date',
      'Refund ka karan',
      'Support email',
      'Support mobile number',
    ],
  },
  {
    number: 9,
    title: 'Company Ka Adhikar',
    paragraphs: [
      'Company suspicious, fraudulent, galat jankari wale ya policy ke misuse se sambandhit cases ki jaanch karne ka adhikar rakhti hai.',
      'Agar kisi account mein galat jankari, unauthorized payment, fake activity ya company ki policy ka misuse paya jata hai, to company lagu niyamon ke anusaar uchit action le sakti hai.',
    ],
  },
  {
    number: 10,
    title: 'Policy Mein Badlav',
    paragraphs: [
      'Zarni Skills samay-samay par is Refund aur Cancellation Policy mein badlav kar sakti hai.',
      'Badli hui policy website par publish hone ki date se lagu hogi.',
      'Kisi customer ke order par samanya roop se purchase ke samay lagu policy ke anusaar vichar kiya jayega.',
    ],
  },
  {
    number: 11,
    title: 'Contact aur Complaint',
    paragraphs: [
      'Refund, payment ya service se sambandhit kisi bhi problem ke liye customer company ki support team se sampark kar sakta hai.',
    ],
  },
];

export default function RefundPolicy() {
  const [support, setSupport] = useState({ email: '', phone: '' });

  useEffect(() => {
    api.get('/global-data')
      .then(res => setSupport({ email: res.data.support_email || '', phone: res.data.support_phone || '' }))
      .catch(() => {});
  }, []);

  return (
    <LegalPageLayout
      icon={RefreshCcw}
      title="Refund aur Cancellation Policy"
      subtitle="Zarni Skills ek digital skill-learning platform hai. Hum students ko alag-alag practical aur high-demand skills sikhane ke liye online courses, training, mentorship aur sambandhit digital services pradan karte hain. Digital courses aur online services ki prakriti ko dhyan mein rakhte hue hamari Refund aur Cancellation Policy nimn prakar se lagu hogi."
      lastUpdated="20 August 2026"
      sections={SECTIONS}
      contact={{
        title: 'Contact aur Complaint',
        email: support.email,
        phone: support.phone,
        workingTime: 'Available 24/7',
      }}
    />
  );
}

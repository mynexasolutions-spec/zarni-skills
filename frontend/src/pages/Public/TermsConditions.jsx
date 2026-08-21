import React, { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import api from '../../utils/api';
import LegalPageLayout from '../../components/Legal/LegalPageLayout';

const SECTIONS = [
  {
    number: 1,
    title: 'Company aur Platform ka Uddeshya',
    paragraphs: [
      'Zarni Skills ek skill-learning aur training platform hai. Hamara uddeshya students ko practical aur high-demand skills sikhana hai, jisse ve freelancing, employment, entrepreneurship ya professional growth ke liye apni skills ko develop kar saken.',
      'Zarni Skills kisi bhi student ko nishchit income, guaranteed job ya fixed earning ka wada nahi karti.',
    ],
  },
  {
    number: 2,
    title: 'Course aur Learning Services',
    paragraphs: [
      'Platform par available courses, videos, live classes, training, mentorship, study material aur anya learning services course package ke anusaar provide ki jayengi.',
      'Kuchh facilities alag packages mein alag ho sakti hain. Customer ko course purchase karne se pehle package mein shamil services ki jankari dhyan se dekhni chahiye.',
      'Company course content, syllabus, trainers, learning method ya platform features mein quality aur improvement ke uddeshya se avashyak badlav kar sakti hai.',
    ],
  },
  {
    number: 3,
    title: 'Account aur Sahi Jankari',
    paragraphs: [
      'User ko account banate samay apna sahi naam, mobile number, email aur anya avashyak jankari deni hogi.',
      'User apne account ke password aur login details ko surakshit rakhne ke liye swayam zimmedar hoga.',
      'Kisi anya vyakti ko apna account dena, bechna ya login details share karna anumati nahi hai.',
    ],
  },
  {
    number: 4,
    title: 'Payment aur Course Purchase',
    paragraphs: [
      'Course ki fees aur package ki jankari payment se pehle platform par dikhai jayegi.',
      'Payment safal hone ke baad course access company ki system process ke anusaar provide kiya jayega.',
      'User ko payment karne se pehle course details, fees aur applicable policies ko dhyan se padhna chahiye.',
    ],
  },
  {
    number: 5,
    title: 'Refund aur Cancellation',
    paragraphs: [
      'Refund aur cancellation se sambandhit niyam company ki alag Refund aur Cancellation Policy ke anusaar lagu honge.',
      'Digital course ya service ka upyog karne ke baad refund ki eligibility course activity, service usage aur company ki applicable policy ke anusaar decide ki ja sakti hai.',
    ],
  },
  {
    number: 6,
    title: 'Referral Program aur Commission',
    paragraphs: [
      'Zarni Skills mein referral program, yadi available ho, company ki official referral policy ke anusaar chalaya jayega.',
      'Referral commission keval eligible aur valid course sale ya company dwara nirdharit eligible transaction ke liye diya jayega.',
      'Commission ki amount, eligibility, payment schedule aur anya conditions company ki official policy ke anusaar hongi.',
      'Fake account banana, khud ko refer karna, galat jankari dena, payment ka galat upyog karna ya referral system ka misuse karna mana hai.',
      'Agar kisi sale ka refund, cancellation, chargeback ya payment reversal hota hai, to us sale se sambandhit commission ko roka, cancel ya adjust kiya ja sakta hai.',
    ],
  },
  {
    number: 7,
    title: 'Income aur Job se Sambandhit Spashtikaran',
    paragraphs: [
      'Zarni Skills kisi bhi user ko fixed income, guaranteed earning, guaranteed freelancing work ya 100% job placement ka wada nahi karti.',
      'User ki income ya career result uski skills, mehnat, practice, experience, performance, market demand, client availability aur anya factors par nirbhar karega.',
      'Platform par dikhaye gaye income examples, success stories ya achievements har user ke liye guaranteed result nahi hain.',
    ],
  },
  {
    number: 8,
    title: 'Galat Marketing aur Misleading Claims',
    paragraphs: [
      'User company ke naam, logo, course ya referral program ka upyog karte samay galat, bharmak ya jhoothe claims nahi karega.',
      'User "Guaranteed Income", "100% Job", "Bina Kaam Paise", "Nishchit Monthly Income" ya kisi bhi prakar ke galat earning claims ka prachar nahi karega.',
      'User company ki official marketing guidelines ka palan karega.',
    ],
  },
  {
    number: 9,
    title: 'Intellectual Property aur Course Content',
    paragraphs: [
      'Zarni Skills ke courses, videos, notes, graphics, designs, logos, study material, website content aur anya digital material company ki property ho sakte hain aur unka upyog keval learning purpose ke liye kiya ja sakta hai.',
      'Company ki written permission ke bina course content ko copy, record, download, share, sell, upload, distribute ya kisi anya vyavsayik purpose ke liye use karna mana hai.',
    ],
  },
  {
    number: 10,
    title: 'User ka Vyavahar',
    paragraphs: [
      'User platform ka upyog kanoon aur company ke niyamon ke anusaar karega.',
      'Kisi bhi prakar ki fraud activity, fake identity, abusive behavior, harassment, spam, unauthorized promotion ya system ka misuse mana hai.',
      'Niyamon ka ullanghan paye jane par company warning, service restriction, account suspension ya anya uchit action le sakti hai.',
    ],
  },
  {
    number: 11,
    title: 'Company ki Seema aur Zimmedari',
    paragraphs: [
      'Company platform ko surakshit aur sahi tareeke se chalane ka prayas karegi, lekin internet, device, payment gateway ya anya third-party technical problems ke karan hone wali har rukavat ke liye company zimmedar nahi hogi.',
      'Company user ke individual earning, job, freelancing income ya business result ki guarantee nahi deti.',
    ],
  },
  {
    number: 12,
    title: 'Policy mein Badlav',
    paragraphs: [
      'Zarni Skills samay-samay par in Niyamon aur Sharton mein badlav kar sakti hai.',
      'Badle hue niyam website ya platform par publish hone ke baad lagu ho sakte hain. User ko samay-samay par updated policy dekhni chahiye.',
    ],
  },
  {
    number: 13,
    title: 'Support aur Complaint',
    paragraphs: [
      'Kisi bhi course, payment, refund, account ya service se sambandhit samasya ke liye user company ki support team se sampark kar sakta hai.',
    ],
  },
  {
    number: 14,
    title: 'Kanooni Adhikar Kshetra',
    paragraphs: [
      'In Niyamon aur Sharton se sambandhit vivad ya kanooni mamle lagu Bharatiya kanoon ke anusaar dekhe jayenge.',
      'Kisi bhi vivad ke sambandh mein kanooni adhikar kshetra company ke registered office ke sthan ke anusaar nirdharit ho sakta hai.',
    ],
  },
];

export default function TermsConditions() {
  const [support, setSupport] = useState({ email: '', phone: '' });

  useEffect(() => {
    api.get('/global-data')
      .then(res => setSupport({ email: res.data.support_email || '', phone: res.data.support_phone || '' }))
      .catch(() => {});
  }, []);

  return (
    <LegalPageLayout
      icon={Scale}
      title="Niyam aur Shartein"
      subtitle="Zarni Skills mein aapka swagat hai. Hamare platform, website, mobile application, courses, training, mentorship ya anya services ka upyog karne se pehle kripya in Niyamon aur Sharton ko dhyan se padhen. Zarni Skills ki services ka upyog karne, account banane, course purchase karne ya payment karne ke baad aap in Niyamon aur Sharton ko sweekar karte hain."
      lastUpdated="20 August 2026"
      sections={SECTIONS}
      contact={{
        title: 'Support aur Complaint',
        email: support.email,
        phone: support.phone,
        workingTime: 'Available 24/7',
      }}
    />
  );
}

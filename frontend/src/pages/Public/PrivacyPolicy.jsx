import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import api from '../../utils/api';
import LegalPageLayout from '../../components/Legal/LegalPageLayout';

const SECTIONS = [
  {
    number: 1,
    title: 'Bhumika (Introduction)',
    paragraphs: [
      'Zarni Skills aapki privacy ka samman karti hai. Yah Privacy Policy batati hai ki jab aap hamari website, mobile application, courses, training, mentorship ya referral program ka upyog karte hain, to hum aapki jankari kaise ikattha karte hain, upyog karte hain aur surakshit rakhte hain.',
      'Hamari services ka upyog karke, account banakar ya course purchase karke aap is Privacy Policy ko sweekar karte hain.',
    ],
  },
  {
    number: 2,
    title: 'Kaunsi Jankari Hum Ikattha Karte Hain',
    paragraphs: [
      'Account banate samay: naam, mobile number, email address, password aur profile details.',
      'KYC aur payout ke liye: bank account, UPI ID aur government ID se sambandhit jankari (agar referral program ka hissa banate hain).',
      'Payment karte samay: order details aur transaction ID. Card ya UPI ke sensitive payment details company ke servers par store nahi kiye jate — ye seedhe payment gateway dwara process kiye jate hain.',
      'Automatically: device information, IP address, browser type aur website ka upyog kaise kiya ja raha hai (cookies aur analytics ke madhyam se).',
    ],
  },
  {
    number: 3,
    title: 'Jankari Ka Upyog Kaise Hota Hai',
    paragraphs: [
      'Account banane, course access dene aur customer support pradan karne ke liye.',
      'Payment process karne, referral commission calculate karne aur payout bhejne ke liye.',
      'Course updates, offers, masterclass aur important notifications bhejne ke liye (email, SMS ya WhatsApp ke madhyam se).',
      'Website aur services ko behtar banane, security sunishchit karne aur fraud rokne ke liye.',
    ],
  },
  {
    number: 4,
    title: 'Jankari Kab Share Ki Jati Hai',
    paragraphs: [
      'Company aapki jankari kisi teesre pakksh ko bechti nahi hai.',
      'Jankari keval in cases mein share ki ja sakti hai: payment gateway aur banking partners (payment process karne ke liye), technology/hosting partners (website chalane ke liye), ya kanoon dwara avashyak hone par sarkari authorities ke saath.',
      'Referral program mein sirf aapka naam aur performance se sambandhit non-sensitive jankari hi team structure ke andar dikhayi ja sakti hai.',
    ],
  },
  {
    number: 5,
    title: 'Cookies Aur Tracking',
    paragraphs: [
      'Website behtar experience dene, login session yaad rakhne aur analytics ke liye cookies ka upyog karti hai.',
      'Aap apne browser settings se cookies ko disable kar sakte hain, lekin isse website ke kuchh features sahi se kaam nahi kar sakte.',
    ],
  },
  {
    number: 6,
    title: 'Data Security',
    paragraphs: [
      'Company aapki jankari ko surakshit rakhne ke liye uchit technical aur organizational measures apnati hai, jaise ki encrypted connections aur restricted access.',
      'Halaanki, internet par kisi bhi transmission ko 100% surakshit guarantee nahi kiya ja sakta. User ko apna password aur login details gopniya rakhne ki zimmedari khud leni hogi.',
    ],
  },
  {
    number: 7,
    title: 'Data Ko Kitne Samay Tak Rakha Jata Hai',
    paragraphs: [
      'Jab tak aapka account active hai ya jab tak legal, accounting ya business ke uddeshya se avashyak ho, tab tak company aapki jankari rakh sakti hai.',
      'Account band karne ki request par, lagu kanoon ke daayre mein rehte hue, jankari ko delete ya anonymize kiya jayega.',
    ],
  },
  {
    number: 8,
    title: 'User Ke Adhikar',
    paragraphs: [
      'User apni profile jankari ko kabhi bhi dekh, update ya sudhaar sakta hai.',
      'User apna account delete karne ya apni jankari ke baare mein jaankari maangne ke liye support team se sampark kar sakta hai.',
      'Marketing emails ya SMS se opt-out karne ka vikalp har communication mein diya jayega.',
    ],
  },
  {
    number: 9,
    title: 'Bacchon Ki Privacy',
    paragraphs: [
      'Hamari services 18 saal ya usse adhik umra ke users ke liye hain. Company jaan-boojhkar naabaalig bacchon se jankari ikattha nahi karti.',
    ],
  },
  {
    number: 10,
    title: 'Third-Party Links',
    paragraphs: [
      'Hamari website ya courses mein kabhi-kabhi third-party links (jaise payment gateway ya social media) shamil ho sakte hain. In third-party platforms ki apni alag privacy policies hoti hain, jinke liye Zarni Skills zimmedar nahi hai.',
    ],
  },
  {
    number: 11,
    title: 'Policy Mein Badlav',
    paragraphs: [
      'Zarni Skills samay-samay par is Privacy Policy mein badlav kar sakti hai.',
      'Badli hui policy website par publish hone ki date se lagu hogi. User ko samay-samay par updated policy dekhni chahiye.',
    ],
  },
  {
    number: 12,
    title: 'Contact',
    paragraphs: [
      'Is Privacy Policy ya aapki jankari se sambandhit kisi bhi sawaal ke liye, aap company ki support team se sampark kar sakte hain.',
    ],
  },
];

export default function PrivacyPolicy() {
  const [support, setSupport] = useState({ email: '', phone: '' });

  useEffect(() => {
    api.get('/global-data')
      .then(res => setSupport({ email: res.data.support_email || '', phone: res.data.support_phone || '' }))
      .catch(() => {});
  }, []);

  return (
    <LegalPageLayout
      icon={Lock}
      title="Privacy Policy"
      subtitle="Zarni Skills aapki privacy ko mahatva deti hai. Yah policy batati hai ki hamari website, application, courses aur referral program ka upyog karte samay aapki jankari kaise ikattha, upyog aur surakshit ki jati hai."
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

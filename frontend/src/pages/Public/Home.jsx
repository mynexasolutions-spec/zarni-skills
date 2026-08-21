import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

// Home Modular Components
import Hero from '../../components/Home/Hero';
import BannerSlider from '../../components/Home/BannerSlider';
import SupportSystem from '../../components/About/SupportSystem';
import BrandsMarquee from '../../components/Home/BrandsMarquee';
import Leaders from '../../components/Home/Leaders';
import PackagesList from '../../components/Home/PackagesList';
import SkillsShowcase from '../../components/Home/SkillsShowcase';
import CoursesSlider from '../../components/Home/CoursesSlider';
import SmartFreelancing from '../../components/About/SmartFreelancing';
import TripAchievement from '../../components/About/TripAchievement';
import AchievementRewards from '../../components/About/AchievementRewards';
import GovernmentCertified from '../../components/About/GovernmentCertified';
import Team from '../../components/Home/Team';
import Testimonials from '../../components/Home/Testimonials';
import SuccessStories from '../../components/Home/SuccessStories';
import FAQ from '../../components/Home/FAQ';
import Newsletter from '../../components/Home/Newsletter';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/global-data');
        setPackages(response.data.packages || []);
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Only the sections that actually depend on fetched data show a loading state below —
  // the rest of the page renders immediately instead of blocking behind a full-page loader.
  return (
    <div className="overflow-hidden bg-transparent text-slate-900">
      <Hero />
      <BrandsMarquee />
      <BannerSlider />
      <SupportSystem />
      <Leaders />
      <PackagesList packages={packages} loading={dataLoading} />
      <SkillsShowcase />
      <CoursesSlider courses={courses} loading={dataLoading} />
      <SmartFreelancing />
      <TripAchievement />
      <AchievementRewards />
      <GovernmentCertified />
      <Team />
      <Testimonials />
      <SuccessStories />
      <FAQ />
      <Newsletter />
    </div>
  );
}

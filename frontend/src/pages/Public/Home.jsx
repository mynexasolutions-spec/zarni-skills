import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

// Home Modular Components
import Hero from '../../components/Home/Hero';
import BrandsMarquee from '../../components/Home/BrandsMarquee';
import Leaders from '../../components/Home/Leaders';
import Transformation from '../../components/Home/Transformation';
import PackagesList from '../../components/Home/PackagesList';
import AffiliateCTA from '../../components/Home/AffiliateCTA';
import CoursesSlider from '../../components/Home/CoursesSlider';
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
    <div className="overflow-hidden bg-slate-50 text-slate-900">
      <Hero />
      <BrandsMarquee />
      <Leaders />
      <Transformation />
      <PackagesList packages={packages} loading={dataLoading} />
      <AffiliateCTA />
      <CoursesSlider courses={courses} loading={dataLoading} />
      <Team />
      <Testimonials />
      <SuccessStories />
      <FAQ />
      <Newsletter />
    </div>
  );
}

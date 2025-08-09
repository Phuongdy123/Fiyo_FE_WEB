import '@/app/assets/css/header.css';
import MiniCartComponent from '../shared/MiniCart';
import HeaderComponent from '@/app/components/shared/layout/Header'
import SearchComponent from '../shared/Search';
export default function HeaderSection() {
  return (
    <>
    <SearchComponent></SearchComponent>
    <MiniCartComponent></MiniCartComponent>
    <HeaderComponent></HeaderComponent>

    </>
  );
}


import { NavLink, useLocation } from "react-router-dom";
import MenuHomeIcon from '@/assets/icons/icon-menu-home.svg?react';
import MenuCalendarIcon from '@/assets/icons/icon-menu-calendar.svg?react';
import MenuRankIcon from '@/assets/icons/icon-menu-rank.svg?react';
import MenuMyIcon from '@/assets/icons/icon-menu-my.svg?react';
import style from './Menu.module.scss';

function Menu() {
  const { pathname } = useLocation();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${style.menu__item}${isActive ? ` ${style.active}` : ""}`;

  return (
    <div className={style.menu}>
      <NavLink to="/" end className={linkClass}>
        <div className={style.menu__item__icon}><MenuHomeIcon /></div>
        <div className={style.menu__item__name}>홈</div>
      </NavLink>

      <NavLink
        to="/schedule"
        className={({ isActive }) =>
          `${style.menu__item}${(isActive || pathname.startsWith("/calendar")) ? ` ${style.active}` : ""}`
        }
      >
        <div className={style.menu__item__icon}><MenuCalendarIcon /></div>
        <div className={style.menu__item__name}>일정</div>
      </NavLink>

      <NavLink to="/ranking" className={linkClass}>
        <div className={style.menu__item__icon}><MenuRankIcon /></div>
        <div className={style.menu__item__name}>랭킹</div>
      </NavLink>

      <NavLink to="/my" className={linkClass}>
        <div className={style.menu__item__icon}><MenuMyIcon /></div>
        <div className={style.menu__item__name}>MY</div>
      </NavLink>
    </div>
  )
}

export default Menu;

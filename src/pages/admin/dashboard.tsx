import { BiMaleFemale } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { HiTrendingDown, HiTrendingUp } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { BarChart, DoughnutChart } from "../../components/admin/Charts";
import Table from "../../components/admin/DashboardTable";
import { Skeleton } from "../../components/loader";
import { useStatsQuery } from "../../redux/api/dashboardApi";
import { RootState } from "../../redux/store";
import { getLastMonths } from "../../utils/features";
import { useEffect, useState } from "react";

// const userImg =
//   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJxA5cTf-5dh5Eusm0puHbvAhOrCRPtckzjA&usqp";

const { last6Months: months } = getLastMonths();

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const userId = user?._id;
    const [userPhoto, setUserPhoto] = useState("")
console.log(userPhoto);

  useEffect(() => {
    if (user && user.photo) {
      setUserPhoto(user.photo);
    }
  }, [user?.photo]);

  const { isLoading, data, isError } = useStatsQuery(userId!, {
    skip: !userId,
  });

  if (!userId || isError ) return <Navigate to="/" />;

  const stats = data?.stats;

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="dashboard">
        {isLoading || !stats ? (
          <Skeleton length={20} />
        ) : (
          <>
            <div className="bar">
              <BsSearch />
              <input type="text" placeholder="Search for data, users, docs" />
              <FaRegBell />
              {userPhoto && (
                <img src={userPhoto} alt="User" />
              )}
            </div>

            <section className="widget-container">
              <WidgetItem
                percent={stats?.percentChange?.revenue ?? 0}
                amount
                value={stats?.counts?.revenue ?? 0}
                heading="Revenue"
                color="rgb(0, 115, 255)"
              />
              <WidgetItem
                percent={stats?.percentChange?.user ?? 0}
                value={stats?.counts?.user ?? 0}
                color="rgb(0 198 202)"
                heading="Users"
              />
              <WidgetItem
                percent={stats?.percentChange?.order ?? 0}
                value={stats?.counts?.order ?? 0}
                color="rgb(255 196 0)"
                heading="Transactions"
              />
              <WidgetItem
                percent={stats?.percentChange?.product ?? 0}
                value={stats?.counts?.product ?? 0}
                color="rgb(76 0 255)"
                heading="Products"
              />
            </section>

            <section className="graph-container">
              <div className="revenue-chart">
                <h2>Revenue & Transaction</h2>
                <BarChart
                  labels={months}
                  data_1={stats?.chart?.revenue ?? []}
                  data_2={stats?.chart?.order ?? []}
                  title_1="Revenue"
                  title_2="Transaction"
                  bgColor_1="rgb(0, 115, 255)"
                  bgColor_2="rgba(53, 162, 235, 0.8)"
                />
              </div>

              <div className="dashboard-categories">
                <h2>Inventory</h2>
                <div>
                  {stats?.categoryCount?.length > 0 ? (
                    stats?.categoryCount.map((i) => {
                      const [heading, value] = Object.entries(i)[0];
                      return (
                        <CategoryItem
                          key={heading}
                          value={value as number}
                          heading={heading}
                          color={`hsl(${(value as number) * 4}, ${value as number
                            }%, 50%)`}
                        />
                      );
                    })
                  ) : (
                    <p>No inventory data</p>
                  )}
                </div>
              </div>
            </section>

            <section className="transaction-container">
              <div className="gender-chart">
                <h2>Gender Ratio</h2>
                <DoughnutChart
                  labels={["Female", "Male"]}
                  data={[
                    stats?.userRatio?.female ?? 0,
                    stats?.userRatio?.male ?? 0,
                  ]}
                  backgroundColor={[
                    "hsl(340, 82%, 56%)",
                    "rgba(53, 162, 235, 0.8)",
                  ]}
                  cutout={90}
                />
                <p>
                  <BiMaleFemale />
                </p>
              </div>
              <Table data={stats?.latestTranaction ?? []} />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

interface WidgetItemProps {
  heading: string;
  value: number;
  percent: number;
  color: string;
  amount?: boolean;
}

const WidgetItem = ({
  heading,
  value,
  percent,
  color,
  amount = false,
}: WidgetItemProps) => {
  const safePercent =
    percent > 10000 ? 9999 : percent < -10000 ? -9999 : percent;

  return (
    <article className="widget">
      <div className="widget-info">
        <p>{heading}</p>
        <h4>{amount ? `₹${value}` : value}</h4>
        {safePercent >= 0 ? (
          <span className="green">
            <HiTrendingUp /> +{safePercent}%
          </span>
        ) : (
          <span className="red">
            <HiTrendingDown /> {safePercent}%
          </span>
        )}
      </div>

      <div
        className="widget-circle"
        style={{
          background: `conic-gradient(
          ${color} ${(Math.abs(safePercent) / 100) * 360}deg,
          rgb(255, 255, 255) 0
        )`,
        }}
      >
        <span style={{ color }}>{safePercent}%</span>
      </div>
    </article>
  );
};

interface CategoryItemProps {
  color: string;
  value: number;
  heading: string;
}

const CategoryItem = ({ color, value, heading }: CategoryItemProps) => (
  <div className="category-item">
    <h5>{heading}</h5>
    <div>
      <div
        style={{
          backgroundColor: color,
          width: `${value}%`,
        }}
      ></div>
    </div>
    <span>{value}%</span>
  </div>
);

export default Dashboard;

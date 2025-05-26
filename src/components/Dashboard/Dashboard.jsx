import UserProfile from "../userProfile/UserProfile";
import MainList from "../MainList/MainList";
const Dashboard = () => {
  return (
    <div>
      <h2>Welcome to your Dashboard!</h2>
      <p>This is a protected area.</p>
      {/* You can render other protected components here */}
      {/* <MainList /> Example: MainList could be protected */}
      <UserProfile /> {/* Example: UserProfile could be protected */}
    </div>
  );
};
export default Dashboard;

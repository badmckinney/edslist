import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProfile, getUsersItems } from '../../actions';
import ProfileItemList from '../../components/ProfileItemList';
import './Profile.scss';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.forSale = this.forSale.bind(this);
    this.sold = this.sold.bind(this);
  }

  componentDidMount() {
    this.props.getProfile();
    this.props.getUsersItems();
  }

  forSale() {
    return this.props.items.filter(item => item.status_id === 1);
  }

  sold() {
    return this.props.items.filter(item => item.status_id === 3);
  }

  render() {
    if (!this.props.currentUser) {
      return (
        <div className="profile-info">
          <div className="error">You must be logged in to view profile</div>
        </div>
      );
    }

    const profile = this.props.profile;

    return (
      <>
        <div className="profile-container">
          <div className="title-container">
            <div className="title">My Account</div>
          </div>
          <div className="user-info-container">
            <div className="left">
              <div className="email">Email: {profile.email}</div>
              <div className="username">Username: {profile.username}</div>
              {/* <div className="password">
                Password:
                <Link to="/password"> change password</Link>
              </div> */}
            </div>

            <div className="right">
              <div className="first-name">First Name: {profile.first_name}</div>
              <div className="last-name">Last Name: {profile.last_name}</div>
              <Link to="/profile/edit">
                <button className="btn">edit profile</button>
              </Link>
            </div>
          </div>
          <div className="status-container">
            <div className="forsale-container">
              <div className="title">For Sale</div>
              <div className="columns-container">
                <div className="column">
                  <div className="column-name">status</div>
                </div>
                <div className="column">
                  <div className="column-name">manage</div>
                </div>
                <div className="column">
                  <div className="column-name">posting title</div>
                </div>
                <div className="column">
                  <div className="column-name">category</div>
                </div>
                <div className="column">
                  <div className="column-name">posted date</div>
                </div>
                <div className="column">
                  <div className="column-name">views</div>
                </div>
                <div className="column">
                  <div className="column-name">id</div>
                </div>
              </div>
              <ProfileItemList items={this.forSale()} />
            </div>
            <div className="sold-container">
              <div className="title">Sold</div>
              <div className="columns-container">
                <div className="column">
                  <div className="column-name">status</div>
                </div>
                <div className="column">
                  <div className="column-name">manage</div>
                </div>
                <div className="column">
                  <div className="column-name">posting title</div>
                </div>
                <div className="column">
                  <div className="column-name">category</div>
                </div>
                <div className="column">
                  <div className="column-name">posted date</div>
                </div>
                <div className="column">
                  <div className="column-name">views</div>
                </div>
                <div className="column">
                  <div className="column-name">id</div>
                </div>
              </div>
              <ProfileItemList items={this.sold()} />
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    profile: state.profile,
    items: state.items,
    currentUser: state.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getProfile: () => dispatch(getProfile()),
    getUsersItems: () => dispatch(getUsersItems())
  };
};

Profile = connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);

export default Profile;

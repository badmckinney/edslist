import React, { Component } from 'react';
import { addItem } from '../../actions';
import { connect } from 'react-redux';
import './NewItem.scss';

class NewItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isError: false,
      category_id: '',
      name: '',
      price: '',
      image: '',
      description: '',
      manufacturer: '',
      model: '',
      condition_id: 2,
      length: '',
      width: '',
      height: '',
      notes: ''
    };

    this.form = React.createRef();
    this.validate = this.validate.bind(this);
    this.error = this.error.bind(this);
    this.handleInputOnChange = this.handleInputOnChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  validate() {
    return this.form.current.reportValidity();
  }

  error() {
    if (this.state.isError) {
      return <div className="error">Error creating post</div>;
    }

    return <></>;
  }

  handleInputOnChange(e) {
    const value = e.target.value;
    const name = e.target.name;
    let file;

    if (e.target.files) {
      file = e.target.files[0];
    }

    if (name === 'image') {
      return this.setState({ image: file });
    }

    return this.setState({ [name]: value });
  }

  handleSubmit(e) {
    e.preventDefault();
    const newItem = this.state;
    const formData = new FormData();

    if (!this.validate()) {
      return;
    }

    for (var key in newItem) {
      if (key === 'image' && !newItem[key]) {
        formData.append(key, '/assets/no-img.jpeg');
      } else {
        formData.append(key, newItem[key]);
      }
    }

    this.props.addItem(formData).then(data => {
      if (!data) {
        return this.setState({ isError: true });
      }

      this.setState({ isError: false });
      this.props.toggleMsg('addItem');
      return this.props.history.push(`/items/${data}`);
    });
  }

  render() {
    if (!this.props.currentUser) {
      return <div className="error">Must be logged in to create post</div>;
    }

    return (
      <div className="add-item-container">
        {this.error()}
        <form ref={this.form}>
          <h1>New Post</h1>
          <div className="top-box">
            <div className="title-price-container">
              <input
                className="name-input"
                type="text"
                name="name"
                placeholder="Name"
                value={this.state.name}
                onChange={this.handleInputOnChange}
                required
              />
              <input
                className="price-input"
                type="number"
                name="price"
                placeholder="Price"
                value={this.state.price}
                onChange={this.handleInputOnChange}
              />
            </div>
            <div className="image">
              <div>Add an image: </div>
              <input
                type="file"
                name="image"
                onChange={this.handleInputOnChange}
              />
            </div>
          </div>

          <div className="description-container">
            <div className="description">
              <label htmlFor="description">Body:</label>
              <textarea
                name="description"
                value={this.state.description}
                onChange={this.handleInputOnChange}
                required
              />
            </div>
          </div>

          <div className="posting-details">
            <div className="details-left">
              <div className="make-model">
                <input
                  type="text"
                  name="manufacturer"
                  placeholder="Manufacturer"
                  value={this.state.manufacturer}
                  onChange={this.handleInputOnChange}
                />
                <input
                  type="text"
                  name="model"
                  placeholder="Model"
                  value={this.state.model}
                  onChange={this.handleInputOnChange}
                />
              </div>

              <div className="select-container">
                <div className="category">
                  <label>Category: </label>
                  <select
                    name="category_id"
                    value={this.state.category_id}
                    onChange={this.handleInputOnChange}
                    required
                  >
                    <option value="">Choose a Category</option>
                    <option value="1">Apparel</option>
                    <option value="2">Appliances</option>
                    <option value="3">Automotive</option>
                    <option value="4">Electronics</option>
                    <option value="5">Furniture</option>
                    <option value="6">Jewelry</option>
                    <option value="7">Musical Instruments</option>
                    <option value="8">Sporting Goods</option>
                    <option value="9">Other</option>
                    <option value="10">Wanted</option>
                  </select>
                </div>

                <div className="condition">
                  <label>Condition: </label>
                  <select
                    name="condition_id"
                    value={this.state.condition_id}
                    onChange={this.handleInputOnChange}
                  >
                    <option value="1">Poor</option>
                    <option value="2">Fair</option>
                    <option value="3">Great</option>
                    <option value="4">Excellent</option>
                    <option value="5">New In Box</option>
                  </select>
                </div>
              </div>
              <div className="dimensions">
                <label className="dimension-name">Dimensions</label>
                <div>
                  <input
                    type="text"
                    name="length"
                    placeholder="length"
                    value={this.state.length}
                    onChange={this.handleInputOnChange}
                  />

                  <input
                    type="text"
                    name="width"
                    placeholder="width"
                    value={this.state.width}
                    onChange={this.handleInputOnChange}
                  />
                  <input
                    type="text-area"
                    name="height"
                    placeholder="height"
                    value={this.state.height}
                    onChange={this.handleInputOnChange}
                  />
                </div>
              </div>
            </div>

            <div className="notes-container">
              <textarea
                name="notes"
                value={this.state.notes}
                placeholder="Additional notes"
                onChange={this.handleInputOnChange}
              />
            </div>
          </div>
          <div className="button-container">
            <div className="submit">
              <button className="btn" onClick={this.handleSubmit}>
                Create Post
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentUser: state.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addItem: item => dispatch(addItem(item))
  };
};

NewItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewItem);

export default NewItem;

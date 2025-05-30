import { useFileHandler } from "6pp";
import { FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { Skeleton } from "../../../components/loader";
import { useDeleteProductsMutation, useProductDetailsQuery, useUpdateProductsMutation } from "../../../redux/api/productApi";
import { RootState, server } from "../../../redux/store";
import { responseToast } from "../../../utils/features";

const Productmanagement = () => {
  const { user } = useSelector((state: RootState) => state.userReducer)
  const params = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError: Error } = useProductDetailsQuery(params.id!)

  const { stock, price, name, category, description } = data?.product || {
    stock: 1,
    price: 1,
    name: "",
    category: "",
    description: "",
  }


  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [priceUpdate, setPriceUpdate] = useState<number>(price);
  const [stockUpdate, setStockUpdate] = useState<number>(stock);
  const [nameUpdate, setNameUpdate] = useState<string>(name);
  const [categoryUpdate, setCategoryUpdate] = useState<string>(category);
  const [descriptionUpdate, setDescriptionUpdate] = useState<string>(description);
  const [updateProduct] = useUpdateProductsMutation()
  const [deleteProduct] = useDeleteProductsMutation()

  const photosFiles = useFileHandler("multiple", 10, 5);
  console.log(photosFiles);


  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true)
    const formData = new FormData();
    if (nameUpdate) formData.set("name", nameUpdate)
    if (priceUpdate) formData.set("price", priceUpdate.toString())
    if (stockUpdate !== undefined) formData.set("stock", stockUpdate.toString())
    if (stockUpdate !== undefined) formData.set("stock", stockUpdate.toString())
    if (photosFiles) formData.set("photo", photosFiles.toString())
    if (categoryUpdate) formData.set("category", categoryUpdate)

    if (user?._id && data?.product._id) {
      const res = await updateProduct({
        formData,
        userId: user._id,
        productId: data.product._id,
      });
      responseToast(res, navigate, "/admin/product")
    }
    setBtnLoading(false)

  };
  const deleteHandler = async () => {
    if (user?._id && data?.product._id) {
      const res = await deleteProduct({
        userId: user._id,
        productId: data.product._id,
      });
      responseToast(res, navigate, "/admin/product")
    }
  };

  useEffect(() => {
    if (data) {
      setNameUpdate(data.product.name)
      setPriceUpdate(data.product.price)
      setStockUpdate(data.product.stock)
      setDescriptionUpdate(data.product.description)
      setCategoryUpdate(data.product.category)
    }
  }, [data])

  if (Error) return <Navigate to={"/404"} />;

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <>
            <section>
              <strong>ID - {data?.product._id}</strong>
              <img src={`${server}/${data?.product.photo}`} alt="Product" />
              <p>{name}</p>
              {stock > 0 ? (
                <span className="green">{stock} Available</span>
              ) : (
                <span className="red"> Not Available</span>
              )}
              <h3>₹{price}</h3>
            </section>
            <article>
              <button className="product-delete-btn" onClick={deleteHandler}>
                <FaTrash />
              </button>
              <form onSubmit={submitHandler}>
                <h2>Manage</h2>
                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={nameUpdate}
                    onChange={(e) => setNameUpdate(e.target.value)}
                  />
                </div>

                <div>
                  <label>Description</label>
                  <textarea
                    
                    placeholder="Description"
                    value={descriptionUpdate}
                    onChange={(e) => setDescriptionUpdate(e.target.value)}
                  />
                </div>
                <div>
                  <label>Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={priceUpdate}
                    onChange={(e) => setPriceUpdate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Stock</label>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={stockUpdate}
                    onChange={(e) => setStockUpdate(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="eg. laptop, camera etc"
                    value={categoryUpdate}
                    onChange={(e) => setCategoryUpdate(e.target.value)}
                  />
                </div>

                <div>
                  <label>Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={photosFiles.changeHandler}
                  />
                </div>

                {photosFiles.error && <p>{photosFiles.error}</p>}

                {photosFiles.preview && (
                  <div
                    style={{ display: "flex", gap: "1rem", overflowX: "auto" }}
                  >
                    {photosFiles.preview.map((img, i) => (
                      <img
                        style={{ width: 100, height: 100, objectFit: "cover" }}
                        key={i}
                        src={img}
                        alt="New Image"
                      />
                    ))}
                  </div>
                )}

                <button disabled={btnLoading} type="submit">
                  Update
                </button>
              </form>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

export default Productmanagement;

import React from "react";
import Axios from "axios";
import { IProduct } from "../../../types/IProduct";
import { useQuery } from "react-query";

const fetchProducts = () => {
  return Axios.get(`http://localhost:3333/products`).then(
    (response) => response.data
  );
};

type ProductsListProps = {
  onProductDetail: (id: number) => void;
};

export const ProductList = ({ onProductDetail }: ProductsListProps) => {
  const { data: products, isLoading } = useQuery<IProduct[]>(["products"], () =>
    fetchProducts()
  );

  if (isLoading || !products) {
    return <h1>Loading products list ...</h1>;
  }

  return (
    <div className="container">
      <h1>Products List</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const name = formData.get("name");
          const price = formData.get("price");
          const description = formData.get("description");
          const image = formData.get("image");

          const newProduct = {
            name,
            price,
            description,
            image,
          } as IProduct;
          console.log(newProduct);
        }}
      >
        <input name="name" placeholder="Type the product name" />
        <input name="price" placeholder="Type the product price" />
        <input name="description" placeholder="Type the product description" />
        <input name="image" placeholder="Type the product image link" />
        <input type="submit" value="Salvar" />
      </form>

      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Detail</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>
                <a
                  href="#"
                  onClick={() => {
                    if (product.id) onProductDetail(product.id);
                  }}
                >
                  Detail
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

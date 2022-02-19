import React from "react";
import Axios from "axios";
import { IProduct } from "../../../types/IProduct";
import { useMutation, useQuery, useQueryClient } from "react-query";

const fetchProducts = () => {
  return Axios.get(`http://localhost:3333/products`).then(
    (response) => response.data
  );
};

const saveProducts = (product: IProduct) => {
  return Axios.post(`http://localhost:3333/products`, product).then(
    (response) => response.data
  );
};

type ProductsListProps = {
  onProductDetail: (id: number) => void;
};

export const ProductList = ({ onProductDetail }: ProductsListProps) => {
  const queryClient = useQueryClient();
  const queryKey = ["products"];

  const { data: products, isLoading } = useQuery<IProduct[]>(queryKey, () =>
    fetchProducts()
  );

  const mutation = useMutation(saveProducts, {
    onMutate: async (updatedProduct) => {
      // cancel the current queries
      await queryClient.cancelQueries(queryKey);

      // get current state
      const previudsState = queryClient.getQueriesData(queryKey);

      // update the current cache
      queryClient.setQueryData<IProduct[]>(queryKey, (oldState) => {
        return [...(oldState ?? []), updatedProduct];
      });

      return { previudsState };
    },
    onError: async (err, variavles, context) => {
      const { previudsState } = context as { previudsState: IProduct[] };
      queryClient.setQueryData(queryKey, previudsState);
    },
    onSettled: async () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

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
          mutation.mutate(newProduct);
        }}
      >
        <input name="name" placeholder="Type the product name" />
        <input name="price" placeholder="Type the product price" />
        <input name="description" placeholder="Type the product description" />
        <input name="image" placeholder="Type the product image link" />
        <input type="submit" value="Salvar" />
      </form>
      {mutation.isLoading && <p>Saving the product...</p>}
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
            <tr key={product.id ?? new Date().getTime()}>
              <td>{product.id ?? "..."}</td>
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

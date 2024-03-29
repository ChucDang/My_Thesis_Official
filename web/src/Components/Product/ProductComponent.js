import React, { useState, useEffect } from 'react'
import { Row, Pagination } from 'react-bootstrap';
import ajax from "../../Services/fechServices";
import ProductItem from './ProductItem';
import './ProductComponent.scss'
import '../Loading/Loading.css';
import ErrorPage from '../ErrorPage/ErrorPage';
import Loading from '../Loading/Loading';
import { useLoading } from '../../Services/LoadingProvider';
import NavBarComponent from '../NavBar/NavBarComponent';
import CarouselComponent from '../NavBar/CarouselComponent';
import FooterComponent from '../Footer/FooterComponent';
const ProductComponent = () => {
    const loading = useLoading()
    let categoryCode = window.location.href.split("/products/category/")[1];
    if (!categoryCode) categoryCode = 'laptop'
    const [products, setProducts] = useState(null)
    const [page, setPage] = useState({
        page: 0,
        size: 2,
        total: ''
    })
    //Tính toán số trang
    let active = page.page + 1
    let items = [];
    for (let number = 1; number <= page.total; number++) {
        items.push(
            <Pagination.Item key={number} active={number === active} onClick={() => handlePageChange(number)}>
                {number}
            </Pagination.Item>,
        );
    }


    const handlePageChange = (number) => {
        if (number && (number <= page.total))
            setPage({ ...page, page: number - 1 })
    }
    useEffect(() => {
        ajax(`/api/products/category/${categoryCode}/${page.page}/${page.size}`, "GET")
            .then(async (response) => {
                let result = await response.json();
                loading.setIsLoading(false)

                setProducts(result.products)
                setPage({ ...page, total: result.total })

                // const productResponse = await response.json();
                // isLoading.setIsLoading(false)
                // setProducts(productResponse.product)
                // setPage({ ...page, total: productResponse.total })
            }).catch(
                <ErrorPage />
            )
    }, [categoryCode, page.page, page.size])
    return loading.isLoading ? (
        <Loading />
    ) :

        <>
            <NavBarComponent />
            <CarouselComponent />
            {
                products ? <Row className='category_label'> {categoryCode} </Row> : <></>
            }


            < Row xs={1} md={2} xl={4} className="justify-content-between mx-4" >
                {
                    products ? products.map(item =>

                        <ProductItem
                            key={item.id}
                            productProps={item}
                            type_display="Card"
                        />




                    ) : <div className='text-primary'>Danh mục này chưa có sản phẩm nào</div>}
            </ Row >
            <Row className="listPage">
                {
                    page.total > 1 ?
                        <>
                            <Pagination>
                                <Pagination.First onClick={() => handlePageChange(1)} />
                                <Pagination.Prev onClick={() => handlePageChange(page.page)} />
                                {items}
                                <Pagination.Next onClick={() => handlePageChange(page.page + 2)} />
                                <Pagination.Last onClick={() => handlePageChange(page.total)} />
                            </Pagination>

                        </> :
                        <></>
                }
            </Row>
            <FooterComponent />
        </>
}
export default ProductComponent

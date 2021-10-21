import { Link, withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import qs from 'qs';
import Menu from '../components/Menu';


function Board(props) {
    // Select Origin
    const local = 'http://localhost:8080/api';
    const deploy = 'https://boardapi.hanjo.xyz/api';
    const origin = local;

    // State
    const query = qs.parse(props.location.search, { ignoreQueryPrefix: true });
    const page = query.page;
    const sort = query.sort;
    const size = 10;
    const [pageList, setPageList] = useState([]);
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState();
    const [prev, setPrev] = useState();
    const [next, setNext] = useState();


    // Effect
    useEffect(() => {
        console.log(page, sort)
        // 페이징 조회 요청
        axios.get(origin + "/post", { params: { page: page - 1, size: size, sort: sort } })
            .then(res => {
                setPosts(res.data.content)
            })
        // 총 게시글 수 받고 페이지 수 계산
        axios.get(origin + "/post/total")
            .then(res => {
                // 전체 페이지 숫자
                let totalPageNum = Math.ceil(res.data / size);
                setTotal(totalPageNum);
                // 현재 페이지가 속한 범위의 리스트
                let startPage = page % 10 == 0 ? (Math.floor(page / 10) - 1) * 10 + 1 : Math.floor(page / 10) * 10 + 1;
                let endPage = startPage + 9 < totalPageNum ? startPage + 9 : totalPageNum;
                let pagesNumList = []
                for (let i = startPage; i <= endPage; i++) {
                    pagesNumList.push(i);
                }
                setPageList(pagesNumList);
                // 이전-다음 페이지 지정 -> *1 페이지로 이동
                setPrev(startPage - 10);
                setNext(endPage + 1);
            })
    }, [props]);

    // button
    const movePage = (page) => {
        props.history.push(`/board?page=${page}&sort=${sort}`);
    }

    const changeSort = (sort) => {
        props.history.push(`/board?page=${page}&sort=${sort}`);
    }

    return (
        <div>

            <Menu />

            <h2>게시판 (page{page})</h2>
            <hr /><br />
            <Link to="/posting" style={{ fontSize: "20px" }}>📝 게시글 작성하기</Link>

            <br /><br /><br />

            <div style={{ textAlign: "center" }}>
                <table>
                    <tr>
                        <th>id(post)
                            {(
                                () => {
                                    if(sort === "id,DESC")
                                        return (<button className="button_sort" onClick={() => changeSort("id,ASC")}>∨</button>)
                                    else
                                        return (<button className="button_sort" onClick={() => changeSort("id,DESC")}>∧</button>)
                                }
                            )()}
                        </th>
                        <th style={{ width: "50%" }}>제목(title)</th>
                        <th>조회수(view)
                            {(
                                () => {
                                    if(sort === "view,DESC")
                                        return (<button className="button_sort" onClick={() => changeSort("view,ASC")}>∨</button>)
                                    else
                                        return (<button className="button_sort" onClick={() => changeSort("view,DESC")}>∧</button>)
                                }
                            )()}
                        </th>
                        <th>작성자(createdBy)</th>
                    </tr>
                    {
                        posts.map(v =>
                            <tr key={v.id}>
                                <td>{v.id}</td>
                                <td><Link to={`/post/${v.id}`} >{v.title}</Link></td>
                                <td>{v.view}</td>
                                <td>{v.createdBy}</td>
                            </tr>
                        )
                    }
                </table>
            </div>

            <br />

            {(
                () => {
                    if (prev > 0) {
                        return (<button className="button_page_move" onClick={() => movePage(prev)}>&lt; 이전</button>)
                    }
                }
            )()}

            {
                pageList.map(v => {
                    if (v == page) {
                        return <button className="button_recent_page" key={v}>{v}</button>
                    }
                    else {
                        return <button className="button_page" key={v} onClick={() => movePage(v)}>{v}</button>
                    }
                })
            }

            {(
                () => {
                    if (next < total) {
                        return (<button className="button_page_move" onClick={() => movePage(next)}>다음 &gt;</button>)
                    }
                }
            )()}

        </div>
    );
}

export default Board;

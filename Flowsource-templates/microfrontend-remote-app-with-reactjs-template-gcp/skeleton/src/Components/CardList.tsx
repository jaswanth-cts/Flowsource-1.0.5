import React from 'react'

interface CardItem {
    id: number;
    title: string;
    body: string;
}

function CardList({ list }: { list: CardItem[] }) {
    return (
        <div className='row container'>
            {list && list.map((item) => {
                return (
                    <div key={item.id} className="col-lg-4 d-flex align-items-stretch">
                        <div className="card">
                            <div className="card-body">
                                <h1 className="card-title">{item.title}</h1>
                                <p className="card-text">{item.body}</p>
                                <a href="#" className="btn btn-primary">Go somewhere</a>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default CardList
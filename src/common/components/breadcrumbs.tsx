import { Fragment } from 'react';
import { Link } from 'react-router';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/common/components/ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/common/types';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    if (!breadcrumbs.length) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <Fragment key={item.href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>
                                        {item.title}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={item.href}>{item.title}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
